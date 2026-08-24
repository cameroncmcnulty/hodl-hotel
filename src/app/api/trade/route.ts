import { NextResponse } from "next/server";
import { TRADE_SLOTS } from "@/lib/constants";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, saveDB } from "@/lib/store";
import type { Item } from "@/lib/types";

export async function GET() {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const open = db.trades.filter((t) => t.status === "open" && (t.a === id || t.b === id));
  return NextResponse.json({ trades: open });
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const op = String(body.op || "");

  if (op === "open") {
    const other = findUser(db, String(body.userId || ""));
    if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const existing = db.trades.find((t) => t.status === "open" && ((t.a === id && t.b === other.id) || (t.b === id && t.a === other.id)));
    if (existing) return NextResponse.json({ trade: existing });
    const trade = {
      id: crypto.randomUUID(),
      a: id,
      b: other.id,
      aItems: [] as Item[],
      bItems: [] as Item[],
      aReady: false,
      bReady: false,
      aLock: false,
      bLock: false,
      roomId: String(body.roomId || ""),
      status: "open" as const,
    };
    db.trades.push(trade);
    saveDB(db);
    return NextResponse.json({ trade });
  }

  const trade = db.trades.find((t) => t.id === body.tradeId);
  if (!trade || trade.status !== "open") return NextResponse.json({ error: "Trade gone" }, { status: 404 });
  if (trade.a !== id && trade.b !== id) return NextResponse.json({ error: "Not your trade" }, { status: 403 });
  const side = trade.a === id ? "a" : "b";

  if (op === "offer") {
    const uids: string[] = Array.isArray(body.uids) ? body.uids.slice(0, TRADE_SLOTS) : [];
    const items = uids.map((uid) => u.backpack.find((s) => s?.uid === uid)).filter(Boolean) as Item[];
    if (side === "a") {
      trade.aItems = items;
      trade.aReady = false;
      trade.bReady = false;
    } else {
      trade.bItems = items;
      trade.aReady = false;
      trade.bReady = false;
    }
    saveDB(db);
    return NextResponse.json({ trade });
  }

  if (op === "ready") {
    if (side === "a") trade.aReady = true;
    else trade.bReady = true;
    saveDB(db);
    return NextResponse.json({ trade });
  }

  if (op === "confirm") {
    if (!trade.aReady || !trade.bReady) return NextResponse.json({ error: "Both must ready first" }, { status: 400 });
    if (side === "a") trade.aLock = true;
    else trade.bLock = true;
    if (trade.aLock && trade.bLock) {
      const A = findUser(db, trade.a)!;
      const B = findUser(db, trade.b)!;
      const take = (who: typeof A, items: Item[]) => {
        for (const it of items) {
          const i = who.backpack.findIndex((s) => s?.uid === it.uid);
          if (i < 0) return false;
          who.backpack[i] = null;
        }
        return true;
      };
      const give = (who: typeof A, items: Item[]) => {
        for (const it of items) {
          const i = who.backpack.findIndex((s) => !s);
          if (i < 0) return false;
          who.backpack[i] = it;
        }
        return true;
      };
      if (!take(A, trade.aItems) || !take(B, trade.bItems) || !give(A, trade.bItems) || !give(B, trade.aItems)) {
        return NextResponse.json({ error: "Backpack space or items changed — cancel and retry" }, { status: 400 });
      }
      trade.status = "done";
      log(db, "trade", `${A.username} traded with ${B.username}`);
    }
    saveDB(db);
    return NextResponse.json({ trade });
  }

  if (op === "cancel") {
    trade.status = "cancel";
    saveDB(db);
    return NextResponse.json({ trade });
  }

  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
