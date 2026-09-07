import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BACKPACK_SLOTS, MIN_AGE, passwordIssues, RESERVED_NAMES, USERNAME_RE } from "@/lib/constants";
import { clampFigure, DEFAULT_FIGURE } from "@/lib/game/avatar";
import { FREE_LAYOUT_IDS, USER_LAYOUTS } from "@/lib/layouts";
import { ageYears } from "@/lib/moderate";
import {
  attachPendingReferral,
  clientIp,
  clientUa,
  deviceCookie,
  deviceFromReq,
  hashSecret,
  isDisposableEmail,
  newDeviceId,
  newVerifyToken,
  normalizeEmail,
  sendVerifyEmail,
  tokenHash,
} from "@/lib/referrals";
import { sessionJson } from "@/lib/session";
import { loadDB, log, publicUser, saveDB } from "@/lib/store";

export const dynamic = "force-dynamic";

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
  const referralCode = String(body.referral || body.ref || "").trim();

  if (!email.includes("@") || email.length > 80) return NextResponse.json({ error: "Need a valid email" }, { status: 400 });
  if (isDisposableEmail(email)) return NextResponse.json({ error: "Use a lasting email — throwaway inboxes are blocked" }, { status: 400 });
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
  const emailNorm = normalizeEmail(email);
  if (db.users.some((u) => u.email === email || u.emailNormalized === emailNorm)) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const ip = clientIp(req);
  const ua = clientUa(req);
  const deviceId = deviceFromReq(req) || newDeviceId();
  const rawToken = newVerifyToken();
  const now = new Date();
  const user = {
    id,
    email,
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    birthday,
    createdAt: now.toISOString(),
    role: "user" as const,
    coins: 0,
    figure: clampFigure(body.figure || DEFAULT_FIGURE),
    friends: [] as string[],
    friendIn: [] as string[],
    friendOut: [] as string[],
    roomHistory: [{ roomId, at: now.toISOString() }],
    backpack: Array.from({ length: BACKPACK_SLOTS }, () => null),
    ownedRoomIds: [roomId],
    ownedLayoutIds: [...FREE_LAYOUT_IDS],
    quests: {},
    tosAcceptedAt: now.toISOString(),
    privacyAcceptedAt: now.toISOString(),
    guidelinesAcceptedAt: now.toISOString(),
    virtualGoodsAcceptedAt: now.toISOString(),
    ageConfirmedAt: now.toISOString(),
    emailNormalized: emailNorm,
    emailVerifyToken: tokenHash(rawToken),
    emailVerifyExpires: new Date(now.getTime() + 48 * 3600 * 1000).toISOString(),
    signupIpHash: hashSecret(ip || `none:${id}`),
    lastIpHash: hashSecret(ip || `none:${id}`),
    signupUaHash: hashSecret(ua || "none"),
    deviceId,
  };
  db.users.push(user);
  db.rooms.push({
    id: roomId,
    name: roomName || `${username}'s pad`,
    ownerId: id,
    layoutId,
    visibility,
    password: visibility === "locked" ? roomPass : undefined,
    furniture: [],
    maxUsers: 25,
    createdAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
  });
  if (referralCode) attachPendingReferral(db, user, referralCode, req, deviceId);
  const mail = await sendVerifyEmail(user, rawToken);
  log(db, "signup", `${username} checked in`);
  saveDB(db);
  const res = sessionJson(
    {
      user: publicUser(user),
      homeRoomId: roomId,
      verifyEmail: true,
      verifySent: mail.sent,
      ...(process.env.NODE_ENV !== "production" ? { verifyUrl: mail.url } : {}),
    },
    id
  );
  const did = deviceCookie(deviceId);
  res.cookies.set(did.name, did.value, did.opts);
  return res;
}
