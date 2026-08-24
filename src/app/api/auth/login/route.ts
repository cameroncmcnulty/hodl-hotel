import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/session";
import { loadDB, publicUser } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.login || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const db = loadDB();
  const user = db.users.find((u) => u.email === id || u.username.toLowerCase() === id);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "Wrong login or password" }, { status: 401 });
  }
  if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    return NextResponse.json({ error: user.banReason || "This account is suspended" }, { status: 403 });
  }
  await setSessionCookie(user.id);
  return NextResponse.json({ user: publicUser(user), homeRoomId: user.ownedRoomIds[0] });
}
