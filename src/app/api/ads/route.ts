import { NextResponse } from "next/server";
import { AD_PLANS } from "@/lib/constants";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, publicUser, saveDB } from "@/lib/store";

export async function GET() {
  const db = loadDB();
  const now = Date.now();
  const spots = [
    { id: "shill-a", roomId: "public-shill-zone", room: "SHILL ZONE", label: "Booth A" },
    { id: "shill-b", roomId: "public-shill-zone", room: "SHILL ZONE", label: "Booth B" },
    { id: "shill-c", roomId: "public-shill-zone", room: "SHILL ZONE", label: "Booth C" },
    { id: "shill-d", roomId: "public-shill-zone", room: "SHILL ZONE", label: "Booth D" },
    { id: "cook-a", roomId: "public-cook-room", room: "The Cook Room", label: "Board A" },
    { id: "cook-b", roomId: "public-cook-room", room: "The Cook Room", label: "Board B" },
  ].map((s) => {
    const live = db.ads.find((a) => a.slotId === s.id && a.status === "live" && new Date(a.end).getTime() > now);
    return { ...s, live: live ? { end: live.end, userId: live.userId, image: live.image } : null };
  });
  return NextResponse.json({ spots, plans: AD_PLANS });
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const plan = AD_PLANS.find((p) => p.id === body.plan);
  const slotId = String(body.slotId || "");
  const image = String(body.image || "");
  if (!plan) return NextResponse.json({ error: "Pick a duration" }, { status: 400 });
  if (!slotId) return NextResponse.json({ error: "Pick a board" }, { status: 400 });
  if (!image.startsWith("data:image/") || image.length > 500_000) {
    return NextResponse.json({ error: "Upload a small PNG/JPG (under ~350KB)" }, { status: 400 });
  }
  const now = Date.now();
  const taken = db.ads.find((a) => a.slotId === slotId && a.status === "live" && new Date(a.end).getTime() > now);
  if (taken && taken.userId !== "hotel") return NextResponse.json({ error: "That board is rented right now" }, { status: 409 });
  if (u.coins < plan.coins) return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
  u.coins -= plan.coins;
  if (taken) taken.status = "removed";
  const roomId = slotId.startsWith("cook") ? "public-cook-room" : "public-shill-zone";
  db.ads.push({
    id: crypto.randomUUID(),
    slotId,
    roomId,
    userId: u.id,
    image,
    plan: plan.id,
    start: new Date().toISOString(),
    end: new Date(now + plan.hours * 3600_000).toISOString(),
    status: "live",
  });
  log(db, "ad", `${u.username} rented ${slotId} (${plan.label})`);
  saveDB(db);
  return NextResponse.json({ user: publicUser(u), ok: true });
}
