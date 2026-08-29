import { NextResponse } from "next/server";
import { COIN_PACKS, PURCHASE_AGE, TREASURY_WALLET } from "@/lib/constants";
import { ageYears } from "@/lib/moderate";
import { cancelInvoice, checkInvoice, createInvoice, publicInvoice, solNetwork } from "@/lib/pay";
import { sessionJson, sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, publicUser, reloadDB, saveDB } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const db = loadDB();
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoice");
  if (invoiceId) {
    const id = await sessionUserId();
    if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
    const out = await checkInvoice(invoiceId, id);
    if ("error" in out && out.status) return NextResponse.json({ error: out.error }, { status: out.status });
    return NextResponse.json({
      invoice: out.invoice ? publicInvoice(out.invoice) : null,
      user: out.user ? publicUser(out.user) : undefined,
    });
  }
  return NextResponse.json({
    packs: COIN_PACKS,
    treasury: db.settings.treasuryWallet || TREASURY_WALLET,
    network: solNetwork(),
  });
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  let db = loadDB();
  let u = findUser(db, id);
  if (!u) {
    db = reloadDB();
    u = findUser(db, id);
  }
  if (!u) return NextResponse.json({ error: "Desk is busy — tap Buy again." }, { status: 409 });
  if (ageYears(u.birthday) < PURCHASE_AGE) {
    return NextResponse.json({ error: "You must be 18+ to buy coins with Solana" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.op === "faucet" && process.env.NODE_ENV !== "production") {
    u.coins += 500;
    saveDB(db);
    return sessionJson({ user: publicUser(u), note: "Local test coins" }, u.id);
  }

  if (body.op === "wallet") {
    u.wallet = String(body.wallet || "");
    saveDB(db);
    return sessionJson({ user: publicUser(u) }, u.id);
  }

  if (body.op === "invoice") {
    try {
      const inv = createInvoice(u.id, String(body.packId || ""));
      return sessionJson({ invoice: publicInvoice(inv), network: solNetwork() }, u.id);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Could not open a desk ticket" }, { status: 400 });
    }
  }

  if (body.op === "check") {
    const out = await checkInvoice(String(body.invoiceId || ""), u.id);
    if ("error" in out && out.status) return NextResponse.json({ error: out.error }, { status: out.status });
    return sessionJson(
      {
        invoice: out.invoice ? publicInvoice(out.invoice) : null,
        user: out.user ? publicUser(out.user) : undefined,
      },
      u.id
    );
  }

  if (body.op === "cancel") {
    const inv = cancelInvoice(String(body.invoiceId || ""), u.id);
    if (!inv) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    return sessionJson({ invoice: publicInvoice(inv) }, u.id);
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
  return sessionJson({ user: publicUser(u), pack }, u.id);
}
