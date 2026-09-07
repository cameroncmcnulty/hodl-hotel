import { NextResponse } from "next/server";
import { newVerifyToken, payReferralIfEligible, sendVerifyEmail, tokenHash } from "@/lib/referrals";
import { sessionJson, sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, publicUser, saveDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = String(url.searchParams.get("token") || "");
  if (!raw) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const db = loadDB();
  const hash = tokenHash(raw);
  const user = db.users.find((u) => u.emailVerifyToken === hash);
  if (!user) return NextResponse.json({ error: "This confirm link is invalid" }, { status: 400 });
  if (user.emailVerifyExpires && new Date(user.emailVerifyExpires) < new Date()) {
    return NextResponse.json({ error: "This confirm link expired. Sign in and resend it." }, { status: 400 });
  }
  user.emailVerifiedAt = new Date().toISOString();
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  const payout = payReferralIfEligible(db, user);
  log(db, "verify", `${user.username} confirmed email`);
  saveDB(db);
  return sessionJson(
    {
      ok: true,
      user: publicUser(user),
      homeRoomId: user.ownedRoomIds[0],
      referralPaid: payout.paid,
    },
    user.id
  );
}

export async function POST() {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  if (u.emailVerifiedAt) return NextResponse.json({ ok: true, already: true });
  const raw = newVerifyToken();
  u.emailVerifyToken = tokenHash(raw);
  u.emailVerifyExpires = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const mail = await sendVerifyEmail(u, raw);
  saveDB(db);
  return NextResponse.json({
    ok: true,
    sent: mail.sent,
    ...(process.env.NODE_ENV !== "production" ? { verifyUrl: mail.url } : {}),
  });
}
