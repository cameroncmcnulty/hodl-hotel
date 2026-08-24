import { NextResponse } from "next/server";
import { CATALOG, furn } from "@/lib/catalog";
import { BACKPACK_SLOTS } from "@/lib/constants";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, publicUser, saveDB } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ catalog: CATALOG });
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const { catalogId, qty } = await req.json().catch(() => ({}));
  const def = furn(String(catalogId || ""));
  if (!def) return NextResponse.json({ error: "Unknown item" }, { status: 400 });
  const n = Math.min(10, Math.max(1, Number(qty) || 1));
  const cost = def.price * n;
  if (u.coins < cost) return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
  const free = u.backpack.filter((s) => !s).length;
  if (free < n) return NextResponse.json({ error: `Need ${n} empty backpack slots` }, { status: 400 });
  u.coins -= cost;
  for (let i = 0; i < n; i++) {
    const slot = u.backpack.findIndex((s) => !s);
    u.backpack[slot] = { uid: crypto.randomUUID(), catalogId: def.id };
  }
  if (def.id === "teleporter") {
    const pads = u.backpack.filter((s) => s?.catalogId === "teleporter") as { uid: string; catalogId: string; pairId?: string }[];
    const unpaired = pads.filter((p) => !p.pairId);
    if (unpaired.length >= 2) {
      const pairId = crypto.randomUUID();
      unpaired[0].pairId = pairId;
      unpaired[1].pairId = pairId;
    }
  }
  const q = u.quests.collector || { progress: 0, done: false };
  if (!q.done) {
    q.progress += n;
    if (q.progress >= 1) {
      q.done = true;
      u.coins += 20;
    }
    u.quests.collector = q;
  }
  log(db, "buy", `${u.username} bought ${n}× ${def.name}`);
  saveDB(db);
  void BACKPACK_SLOTS;
  return NextResponse.json({ user: publicUser(u), item: def });
}
