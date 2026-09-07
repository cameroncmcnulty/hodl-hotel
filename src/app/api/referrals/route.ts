import { NextResponse } from "next/server";
import { REFERRAL_COINS } from "@/lib/constants";
import { siteUrl } from "@/lib/mail";
import { referralStats } from "@/lib/referrals";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const stats = referralStats(db, u.id);
  const url = `${siteUrl()}/join?ref=${encodeURIComponent(u.username)}`;
  return NextResponse.json({
    code: u.username,
    url,
    reward: REFERRAL_COINS,
    ...stats,
  });
}
