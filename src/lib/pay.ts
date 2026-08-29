import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { COIN_PACKS, TREASURY_WALLET } from "./constants";
import type { Invoice } from "./types";
import { findUser, loadDB, log, saveDB } from "./store";

const FEE = 5000;
const TTL_MS = 20 * 60 * 1000;
const g = globalThis as unknown as { __hodlPayLock?: Set<string> };

function lockSet() {
  if (!g.__hodlPayLock) g.__hodlPayLock = new Set();
  return g.__hodlPayLock;
}

function payKey() {
  return createHash("sha256")
    .update(process.env.PAYMENT_SECRET || process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "hodl-hotel-pay")
    .digest();
}

function seal(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", payKey(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

function openSeal(s: string) {
  const [iv, tag, enc] = s.split(".");
  const d = createDecipheriv("aes-256-gcm", payKey(), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(enc, "base64url")), d.final()]).toString("utf8");
}

export function rpcUrl() {
  return process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

export function solNetwork() {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta";
}

function conn() {
  return new Connection(rpcUrl(), "confirmed");
}

export function publicInvoice(inv: Invoice) {
  return {
    id: inv.id,
    packId: inv.packId,
    coins: inv.coins,
    sol: inv.sol,
    lamports: inv.lamports,
    address: inv.address,
    status: inv.status,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
    paySig: inv.paySig,
    forwardSig: inv.forwardSig,
    error: inv.error,
  };
}

export function createInvoice(userId: string, packId: string) {
  const pack = COIN_PACKS.find((p) => p.id === packId);
  if (!pack) throw new Error("Unknown pack");
  const db = loadDB();
  const now = Date.now();
  db.invoices = db.invoices || [];
  const existing = db.invoices.find((i) => i.userId === userId && i.packId === packId && i.status === "waiting" && new Date(i.expiresAt).getTime() > now);
  if (existing) return existing;
  for (const i of db.invoices) {
    if (i.userId === userId && i.status === "waiting") {
      i.status = "expired";
      i.error = "Replaced by a new desk ticket";
    }
  }
  const kp = Keypair.generate();
  const inv: Invoice = {
    id: crypto.randomUUID(),
    userId,
    packId: pack.id,
    coins: pack.coins,
    sol: pack.sol,
    lamports: Math.round(pack.sol * 1e9),
    address: kp.publicKey.toBase58(),
    secret: seal(Buffer.from(kp.secretKey).toString("base64")),
    status: "waiting",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(now + TTL_MS).toISOString(),
  };
  db.invoices.unshift(inv);
  db.invoices = db.invoices.slice(0, 400);
  log(db, "sol", `Invoice ${inv.address.slice(0, 8)}… for ${pack.name}`);
  saveDB(db);
  return inv;
}

async function latestSig(address: string) {
  const c = conn();
  const sigs = await c.getSignaturesForAddress(new PublicKey(address), { limit: 1 });
  return sigs[0]?.signature;
}

async function sweep(inv: Invoice) {
  const kp = Keypair.fromSecretKey(Buffer.from(openSeal(inv.secret), "base64"));
  const c = conn();
  const db = loadDB();
  const treasury = db.settings.treasuryWallet || TREASURY_WALLET;
  const bal = await c.getBalance(kp.publicKey, "confirmed");
  if (bal <= FEE) throw new Error("Deposit too small to forward");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: kp.publicKey,
      toPubkey: new PublicKey(treasury),
      lamports: bal - FEE,
    })
  );
  return sendAndConfirmTransaction(c, tx, [kp], { commitment: "confirmed", maxRetries: 5 });
}

export async function checkInvoice(invoiceId: string, userId: string) {
  const db = loadDB();
  db.invoices = db.invoices || [];
  const inv = db.invoices.find((i) => i.id === invoiceId);
  if (!inv || inv.userId !== userId) return { error: "Ticket not found", status: 404 as const };
  const now = Date.now();
  if (inv.status === "waiting" && new Date(inv.expiresAt).getTime() < now) {
    inv.status = "expired";
    inv.error = "This desk ticket expired. Start a new one.";
    saveDB(db);
    return { invoice: inv };
  }
  if (inv.status === "credited" || inv.status === "expired" || inv.status === "failed") {
    return { invoice: inv };
  }

  const locks = lockSet();
  if (locks.has(inv.id)) return { invoice: inv };
  locks.add(inv.id);
  try {
    if (inv.status === "waiting") {
      const bal = await conn().getBalance(new PublicKey(inv.address), "confirmed");
      if (bal >= Math.round(inv.lamports * 0.98)) {
        inv.status = "received";
        inv.paySig = (await latestSig(inv.address)) || inv.paySig;
        saveDB(db);
      }
    }
    if (inv.status === "received" && !inv.forwardSig) {
      try {
        inv.forwardSig = await sweep(inv);
        inv.error = undefined;
        saveDB(db);
      } catch (e) {
        inv.error = e instanceof Error ? e.message : "Could not forward to treasury yet";
        saveDB(db);
        return { invoice: inv };
      }
    }
    if (inv.status === "received" && inv.forwardSig) {
      const u = findUser(db, inv.userId);
      if (!u) {
        inv.status = "failed";
        inv.error = "Guest missing";
        saveDB(db);
        return { invoice: inv };
      }
      const sig = inv.forwardSig;
      if (!db.receipts.some((r) => r.sig === sig)) {
        u.coins += inv.coins;
        db.receipts.push({
          id: crypto.randomUUID(),
          userId: u.id,
          packId: inv.packId,
          sig,
          coins: inv.coins,
          sol: inv.sol,
          at: new Date().toISOString(),
        });
        log(db, "sol", `${u.username} paid ${inv.sol} SOL → ${inv.coins} coins`);
      }
      inv.status = "credited";
      saveDB(db);
      return { invoice: inv, user: u };
    }
    return { invoice: inv };
  } finally {
    locks.delete(inv.id);
  }
}

export function cancelInvoice(invoiceId: string, userId: string) {
  const db = loadDB();
  db.invoices = db.invoices || [];
  const inv = db.invoices.find((i) => i.id === invoiceId && i.userId === userId);
  if (!inv) return null;
  if (inv.status === "waiting") {
    inv.status = "expired";
    inv.error = "Cancelled";
    saveDB(db);
  }
  return inv;
}
