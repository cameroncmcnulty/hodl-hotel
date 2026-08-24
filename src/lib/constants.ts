export const TREASURY_WALLET =
  process.env.NEXT_PUBLIC_TREASURY_WALLET ||
  process.env.TREASURY_WALLET ||
  "DFpam8jgBo1gqJ2aoUs3n7SVaptDEHSBxiZKFg3Fz3JN";

export const STARTER_COINS = 400;
export const BACKPACK_SLOTS = 30;
export const HISTORY_LIMIT = 10;
export const CHAT_MAX = 80;
export const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;
export const ROOM_NAME_MAX = 24;
export const MIN_AGE = 13;
export const PURCHASE_AGE = 18;

export function passwordIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 10) issues.push("At least 10 characters");
  if (!/[a-z]/.test(pw)) issues.push("One lowercase letter");
  if (!/[A-Z]/.test(pw)) issues.push("One uppercase letter");
  if (!/[0-9]/.test(pw)) issues.push("One number");
  return issues;
}
export const TRADE_SLOTS = 6;

export const RESERVED_NAMES = new Set([
  "admin",
  "administrator",
  "mod",
  "moderator",
  "system",
  "hodl",
  "hodlhotel",
  "hotel",
  "staff",
  "support",
  "owner",
  "null",
  "undefined",
]);

export const COIN_PACKS = [
  { id: "pocket", name: "Pocket Pack", coins: 250, sol: 0.03, tag: "Try a few pieces" },
  { id: "carry", name: "Carry-On", coins: 800, sol: 0.08, tag: "Furnish a studio" },
  { id: "suite", name: "Suite Bundle", coins: 2000, sol: 0.18, tag: "Most popular" },
  { id: "penthouse", name: "Penthouse Crate", coins: 5000, sol: 0.4, tag: "Serious decorator" },
  { id: "whale", name: "Whale Vault", coins: 15000, sol: 1.0, tag: "Diamond hands" },
] as const;

export const AD_PLANS = [
  { id: "day", label: "1 day", hours: 24, coins: 120 },
  { id: "week", label: "1 week", hours: 24 * 7, coins: 600 },
  { id: "month", label: "1 month", hours: 24 * 30, coins: 1800 },
] as const;
