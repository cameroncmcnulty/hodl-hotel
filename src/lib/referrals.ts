import { createHash, createHmac, randomBytes } from "crypto";
import { REFERRAL_COINS, REFERRAL_DAILY_CAP } from "./constants";
import { sendMail, siteUrl } from "./mail";
import { log } from "./store";
import type { DB, Referral, User } from "./types";

const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tmpmail.org",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "trash-mail.com",
  "getnada.com",
  "mailnesia.com",
  "maildrop.cc",
  "discard.email",
  "discarded.me",
  "fakeinbox.com",
  "mintemail.com",
  "mytemp.email",
  "emailondeck.com",
  "moakt.com",
  "getairmail.com",
  "mailcatch.com",
  "inboxkitten.com",
  "tempail.com",
]);

function secret() {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

export function hashSecret(value: string) {
  return createHmac("sha256", secret()).update(value.trim().toLowerCase()).digest("hex");
}

export function clientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip =
    xf.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-vercel-forwarded-for") ||
    "";
  return ip.replace(/^::ffff:/, "");
}

export function clientUa(req: Request) {
  return req.headers.get("user-agent") || "";
}

export function deviceFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)hodl_did=([^;]+)/);
  return m?.[1] || "";
}

export function newDeviceId() {
  return randomBytes(16).toString("hex");
}

export function deviceCookie(id: string) {
  return {
    name: "hodl_did",
    value: id,
    opts: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 400 * 24 * 3600,
    },
  };
}

export function normalizeEmail(email: string) {
  const raw = email.trim().toLowerCase();
  const at = raw.lastIndexOf("@");
  if (at < 1) return raw;
  let local = raw.slice(0, at);
  let domain = raw.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  local = local.split("+")[0];
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

export function isDisposableEmail(email: string) {
  const domain = normalizeEmail(email).split("@")[1] || "";
  if (DISPOSABLE.has(domain)) return true;
  if (/(^|\.)temp(mail|inbox)/.test(domain)) return true;
  if (/(^|\.)(throwaway|trashmail|fakeinbox)/.test(domain)) return true;
  return false;
}

export function newVerifyToken() {
  return randomBytes(24).toString("hex");
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendVerifyEmail(user: User, rawToken: string) {
  const url = `${siteUrl()}/verify?token=${rawToken}`;
  const text = `Confirm your HODL Hotel email.\n\n${url}\n\nThis link expires in 48 hours. If you didn't create an account, ignore this.`;
  const sent = await sendMail(user.email, "Confirm your HODL Hotel email", text);
  return { sent, url };
}

export function findReferrer(db: DB, code: string) {
  const c = code.trim().toLowerCase();
  if (!c) return undefined;
  return db.users.find((u) => u.username.toLowerCase() === c);
}

function paidFingerprints(db: DB) {
  const ip = new Set<string>();
  const device = new Set<string>();
  const email = new Set<string>();
  for (const r of db.referrals || []) {
    if (r.status !== "paid") continue;
    if (r.ipHash) ip.add(r.ipHash);
    if (r.deviceId) device.add(r.deviceId);
    if (r.emailNorm) email.add(r.emailNorm);
  }
  return { ip, device, email };
}

export function referralRejectReason(db: DB, referee: User, pending: Referral): string | null {
  const referrer = db.users.find((u) => u.id === pending.referrerId);
  if (!referrer) return "referrer-missing";
  if (referrer.id === referee.id) return "self";
  if (referrer.bannedUntil && new Date(referrer.bannedUntil) > new Date()) return "referrer-banned";
  if (!referee.emailVerifiedAt) return "unverified";
  if (isDisposableEmail(referee.email)) return "disposable-email";
  const fp = paidFingerprints(db);
  if (pending.emailNorm && fp.email.has(pending.emailNorm)) return "email-used";
  if (pending.ipHash && fp.ip.has(pending.ipHash)) return "ip-used";
  if (pending.deviceId && fp.device.has(pending.deviceId)) return "device-used";
  if (pending.ipHash && (pending.ipHash === referrer.signupIpHash || pending.ipHash === referrer.lastIpHash)) {
    return "same-ip-as-referrer";
  }
  const dayAgo = Date.now() - 864e5;
  const recent = (db.referrals || []).filter(
    (r) => r.referrerId === referrer.id && r.status === "paid" && new Date(r.paidAt || r.createdAt).getTime() > dayAgo
  ).length;
  if (recent >= REFERRAL_DAILY_CAP) return "daily-cap";
  return null;
}

export function attachPendingReferral(
  db: DB,
  referee: User,
  code: string,
  req: Request,
  deviceId: string
): Referral | null {
  const referrer = findReferrer(db, code);
  if (!referrer || referrer.id === referee.id) return null;
  if (!db.referrals) db.referrals = [];
  const rec: Referral = {
    id: crypto.randomUUID(),
    referrerId: referrer.id,
    refereeId: referee.id,
    code: referrer.username,
    ipHash: referee.signupIpHash || hashSecret(clientIp(req) || "none"),
    uaHash: referee.signupUaHash || hashSecret(clientUa(req) || "none"),
    deviceId: deviceId || referee.deviceId || "",
    emailNorm: referee.emailNormalized || normalizeEmail(referee.email),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.referrals.push(rec);
  referee.referredByUserId = referrer.id;
  return rec;
}

export function payReferralIfEligible(db: DB, referee: User) {
  if (!db.referrals) db.referrals = [];
  const pending = db.referrals.find((r) => r.refereeId === referee.id && r.status === "pending");
  if (!pending) return { paid: false as const };
  const reason = referralRejectReason(db, referee, pending);
  if (reason) {
    pending.status = "rejected";
    pending.reason = reason;
    log(db, "referral", `rejected ${referee.username} → ${pending.code} (${reason})`);
    return { paid: false as const, reason };
  }
  const referrer = db.users.find((u) => u.id === pending.referrerId);
  if (!referrer) {
    pending.status = "rejected";
    pending.reason = "referrer-missing";
    return { paid: false as const, reason: "referrer-missing" };
  }
  referrer.coins += REFERRAL_COINS;
  pending.status = "paid";
  pending.paidAt = new Date().toISOString();
  log(db, "referral", `${referrer.username} earned ${REFERRAL_COINS}c for ${referee.username}`);
  return { paid: true as const, referrerId: referrer.id, coins: REFERRAL_COINS };
}

export function referralStats(db: DB, userId: string) {
  const rows = (db.referrals || []).filter((r) => r.referrerId === userId);
  const paid = rows.filter((r) => r.status === "paid").length;
  const pending = rows.filter((r) => r.status === "pending").length;
  return { paid, pending, coinsEarned: paid * REFERRAL_COINS };
}
