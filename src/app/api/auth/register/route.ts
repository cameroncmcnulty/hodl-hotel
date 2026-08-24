import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BACKPACK_SLOTS, MIN_AGE, passwordIssues, RESERVED_NAMES, USERNAME_RE } from "@/lib/constants";
import { clampFigure, DEFAULT_FIGURE } from "@/lib/game/avatar";
import { layoutById, USER_LAYOUTS, walkable } from "@/lib/layouts";
import { ageYears } from "@/lib/moderate";
import { setSessionCookie } from "@/lib/session";
import { loadDB, log, publicUser, saveDB } from "@/lib/store";

export async function POST(req: Request) {
  const db = loadDB();
  if (!db.settings.signupEnabled) return NextResponse.json({ error: "Signups closed" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const username = String(body.username || "").trim();
  const birthday = String(body.birthday || "");
  const roomName = String(body.roomName || `${username}'s pad`).slice(0, 24);
  const visibility = body.visibility === "locked" ? "locked" : "public";
  const roomPass = String(body.roomPassword || "");
  const layoutId = String(body.layoutId || "cozy_studio");

  if (!email.includes("@") || email.length > 80) return NextResponse.json({ error: "Need a valid email" }, { status: 400 });
  const pw = passwordIssues(password);
  if (pw.length) return NextResponse.json({ error: `Password needs: ${pw.join(", ")}` }, { status: 400 });
  if (!body.tos || !body.privacy || !body.guidelines || !body.virtualGoods || !body.ageConfirm) {
    return NextResponse.json({ error: "Please accept the required legal notices" }, { status: 400 });
  }
  if (!USERNAME_RE.test(username) || RESERVED_NAMES.has(username.toLowerCase())) {
    return NextResponse.json({ error: "Username must be 3–16 letters, numbers, or _" }, { status: 400 });
  }
  const years = ageYears(birthday);
  if (years < MIN_AGE) {
    return NextResponse.json({ error: "You must be 13 or older to create an account" }, { status: 400 });
  }
  if (years < 18 && !body.guardian) {
    return NextResponse.json({ error: "Players 13–17 need a parent or guardian’s permission to play" }, { status: 400 });
  }
  if (!USER_LAYOUTS.some((l) => l.id === layoutId)) return NextResponse.json({ error: "Pick a room layout" }, { status: 400 });
  if (visibility === "locked" && roomPass.length < 3) {
    return NextResponse.json({ error: "Locked rooms need a password (3+ chars)" }, { status: 400 });
  }
  if (db.users.some((u) => u.email === email)) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const user = {
    id,
    email,
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    birthday,
    createdAt: new Date().toISOString(),
    role: "user" as const,
    coins: db.settings.starterCoins,
    figure: clampFigure(body.figure || DEFAULT_FIGURE),
    friends: [] as string[],
    friendIn: [] as string[],
    friendOut: [] as string[],
    roomHistory: [{ roomId, at: new Date().toISOString() }],
    backpack: Array.from({ length: BACKPACK_SLOTS }, () => null),
    ownedRoomIds: [roomId],
    quests: {},
    tosAcceptedAt: new Date().toISOString(),
    privacyAcceptedAt: new Date().toISOString(),
    guidelinesAcceptedAt: new Date().toISOString(),
    virtualGoodsAcceptedAt: new Date().toISOString(),
    ageConfirmedAt: new Date().toISOString(),
  };
  db.users.push(user);
  const layout = layoutById(layoutId);
  const sx = layout.spawn.x;
  const sy = layout.spawn.y;
  const spot = (dx: number, dy: number) =>
    walkable(layout, sx + dx, sy + dy) ? { x: sx + dx, y: sy + dy } : { x: sx, y: sy };
  const plant = spot(1, 0);
  const lamp = spot(0, 1);
  db.rooms.push({
    id: roomId,
    name: roomName || `${username}'s pad`,
    ownerId: id,
    layoutId,
    visibility,
    password: visibility === "locked" ? roomPass : undefined,
    furniture: [
      { uid: crypto.randomUUID(), catalogId: "rug_small", x: sx, y: sy, rot: 0 as const, ownerId: id },
      { uid: crypto.randomUUID(), catalogId: "plant_palm", x: plant.x, y: plant.y, rot: 0 as const, ownerId: id },
      { uid: crypto.randomUUID(), catalogId: "lamp_floor", x: lamp.x, y: lamp.y, rot: 0 as const, ownerId: id },
    ],
    maxUsers: 25,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  });
  log(db, "signup", `${username} checked in`);
  saveDB(db);
  await setSessionCookie(id);
  return NextResponse.json({ user: publicUser(user), homeRoomId: roomId });
}
