import { NextResponse } from "next/server";
import { COIN_PACKS, PURCHASE_AGE, TREASURY_WALLET } from "@/lib/constants";
import { ageYears } from "@/lib/moderate";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, publicUser, saveDB } from "@/lib/store";

export async function GET() {
  const db = loadDB();
  return NextResponse.json({
    packs: COIN_PACKS,
    treasury: db.settings.treasuryWallet || TREASURY_WALLET,
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta",
  });
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  if (ageYears(u.birthday) < PURCHASE_AGE) {
    return NextResponse.json({ error: "You must be 18+ to buy coins with Solana" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.op === "faucet" && process.env.NODE_ENV !== "production") {
    u.coins += 500;
    saveDB(db);
    return NextResponse.json({ user: publicUser(u), note: "Local test coins" });
  }

  if (body.op === "wallet") {
    u.wallet = String(body.wallet || "");
    saveDB(db);
    return NextResponse.json({ user: publicUser(u) });
  }

  const pack = COIN_PACKS.find((p) => p.id === body.packId);
  const sig = String(body.sig || "");
  const treasury = db.settings.treasuryWallet || TREASURY_WALLET;
  if (!pack) return NextResponse.json({ error: "Unknown pack" }, { status: 400 });
  if (!treasury) return NextResponse.json({ error: "Treasury wallet not configured yet" }, { status: 503 });
  if (!sig || sig.length < 32) return NextResponse.json({ error: "Missing transaction" }, { status: 400 });
  if (db.receipts.some((r) => r.sig === sig)) return NextResponse.json({ error: "Already claimed" }, { status: 409 });

  const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [sig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" }],
    }),
  });
  const json = await res.json();
  const tx = json.result;
  if (!tx) return NextResponse.json({ error: "Transaction not found yet. Wait a few seconds and retry." }, { status: 404 });
  const keys: string[] =
    tx.transaction?.message?.accountKeys?.map((k: string | { pubkey: string }) => (typeof k === "string" ? k : k.pubkey)) ||
    [];
  const native = tx.meta?.postBalances && tx.meta?.preBalances;
  if (!native) return NextResponse.json({ error: "Could not read balances" }, { status: 400 });
  const tIndex = keys.findIndex((k: string) => k === treasury);
  if (tIndex < 0) return NextResponse.json({ error: "Payment did not reach the hotel treasury" }, { status: 400 });
  const lamports = (tx.meta.postBalances[tIndex] || 0) - (tx.meta.preBalances[tIndex] || 0);
  const need = Math.round(pack.sol * 1e9);
  if (lamports < need * 0.98) {
    return NextResponse.json({ error: "Amount too small for that pack" }, { status: 400 });
  }

  u.coins += pack.coins;
  if (body.wallet) u.wallet = String(body.wallet);
  db.receipts.push({
    id: crypto.randomUUID(),
    userId: u.id,
    packId: pack.id,
    sig,
    coins: pack.coins,
    sol: pack.sol,
    at: new Date().toISOString(),
  });
  log(db, "sol", `${u.username} bought ${pack.name} (${pack.coins} coins)`);
  saveDB(db);
  return NextResponse.json({ user: publicUser(u), pack });
}
