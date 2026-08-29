import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "hodl_session";

function secret() {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

export function signSession(userId: string, days = 14) {
  const exp = Date.now() + days * 864e5;
  const body = Buffer.from(JSON.stringify({ u: userId, exp })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readSession(token: string | undefined | null): { u: string; exp: number } | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { u: string; exp: number };
    if (!payload?.u || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 14 * 24 * 3600,
  };
}

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, signSession(userId), cookieOpts());
}

export function attachSession(res: NextResponse, userId: string) {
  const token = signSession(userId);
  res.cookies.set(COOKIE, token, cookieOpts());
  return token;
}

export function sessionJson(data: Record<string, unknown>, userId: string, status = 200) {
  const token = signSession(userId);
  const res = NextResponse.json({ ...data, token }, { status });
  res.cookies.set(COOKIE, token, cookieOpts());
  return res;
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function sessionUserId() {
  const jar = await cookies();
  const h = await headers();
  const token = jar.get(COOKIE)?.value || h.get("x-hodl-session") || "";
  return readSession(token)?.u || null;
}
