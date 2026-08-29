import { NextResponse } from "next/server";
import { CATALOG, furn } from "@/lib/catalog";
import { BACKPACK_SLOTS } from "@/lib/constants";
import { FREE_LAYOUT_IDS, PREMIUM_LAYOUTS } from "@/lib/layouts";
import { sessionJson, sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, publicUser, reloadDB, saveDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    catalog: CATALOG.filter((f) => !f.hotelOnly && f.id !== "ad_board"),
    plans: PREMIUM_LAYOUTS.map((l) => ({ id: l.id, name: l.name, blurb: l.blurb, price: l.price })),
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
  const body = await req.json().catch(() => ({}));
  if (body.layoutId) {
    const layout = PREMIUM_LAYOUTS.find((l) => l.id === body.layoutId);
    if (!layout) return NextResponse.json({ error: "Not a premium floor plan" }, { status: 400 });
    if (!u.ownedLayoutIds) u.ownedLayoutIds = [...FREE_LAYOUT_IDS];
    if (u.ownedLayoutIds.includes(layout.id)) return NextResponse.json({ error: "You already own this plan" }, { status: 400 });
    const price = layout.price || 0;
    if (u.coins < price) return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
    u.coins -= price;
    u.ownedLayoutIds.push(layout.id);
    log(db, "buy", `${u.username} unlocked floor plan ${layout.name}`);
    saveDB(db);
    return sessionJson({ user: publicUser(u), plan: layout }, u.id);
  }
  const { catalogId, qty } = body;
  const def = furn(String(catalogId || ""));
  if (!def || def.hotelOnly) return NextResponse.json({ error: "Unknown item" }, { status: 400 });
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
  return sessionJson(
    {
      user: publicUser(u),
      item: def,
      message: `Purchase successful — ${def.name} is in your backpack.`,
    },
    u.id
  );
}
