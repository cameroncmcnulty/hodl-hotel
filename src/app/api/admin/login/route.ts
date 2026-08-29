import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sessionJson } from "@/lib/session";
import { loadDB, publicUser, reloadDB } from "@/lib/store";

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
    return NextResponse.json({ error: "Wrong desk key" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Staff only. This door is for the hotel desk." }, { status: 403 });
  }
  if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    return NextResponse.json({ error: user.banReason || "This desk key is suspended" }, { status: 403 });
  }
  return sessionJson({ user: publicUser(user), desk: true }, user.id);
}
