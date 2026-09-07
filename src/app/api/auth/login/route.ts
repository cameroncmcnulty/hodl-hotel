import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { clientIp, hashSecret } from "@/lib/referrals";
import { sessionJson } from "@/lib/session";
import { loadDB, publicUser, reloadDB, saveDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.login || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  let db = loadDB();
  let user = db.users.find((u) => u.email === id || u.username.toLowerCase() === id);
  if (!user) {
    db = reloadDB();
    user = db.users.find((u) => u.email === id || u.username.toLowerCase() === id);
  }
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "Wrong login or password" }, { status: 401 });
  }
  if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    return NextResponse.json({ error: user.banReason || "This account is suspended" }, { status: 403 });
  }
  const ip = clientIp(req);
  if (ip) {
    user.lastIpHash = hashSecret(ip);
    saveDB(db);
  }
  return sessionJson({ user: publicUser(user), homeRoomId: user.ownedRoomIds[0] }, user.id);
}
