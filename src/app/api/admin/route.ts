import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";
import { githubReady } from "@/lib/githubShip";
import { ensureSegments } from "@/lib/grokHelp";
import { filesReady, xaiReady } from "@/lib/grokAgent";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB, log, occupantCount, saveDB } from "@/lib/store";

async function admin() {
  const id = await sessionUserId();
  if (!id) return null;
  const db = loadDB();
  const u = findUser(db, id);
  if (!u || u.role !== "admin") return null;
  return { db, u };
}

export async function GET() {
  const a = await admin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 401 });
  const { db } = a;
  const online = db.rooms.reduce((n, r) => n + occupantCount(r.id), 0);
  return NextResponse.json({
    stats: {
      users: db.users.length,
      rooms: db.rooms.length,
      online,
      coins: db.users.reduce((n, u) => n + u.coins, 0),
      receipts: db.receipts.length,
      sol: db.receipts.reduce((n, r) => n + r.sol, 0),
      ads: db.ads.filter((x) => x.status === "live").length,
      reports: db.reports.filter((r) => r.status === "open").length,
    },
    users: db.users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      coins: u.coins,
      role: u.role,
      createdAt: u.createdAt,
      bannedUntil: u.bannedUntil,
      mutedUntil: u.mutedUntil,
    })),
    rooms: db.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      ownerId: r.ownerId,
      users: occupantCount(r.id),
      visibility: r.visibility,
    })),
    reports: db.reports.slice(0, 80),
    ads: db.ads.slice(0, 80),
    receipts: db.receipts.slice(0, 80),
    events: db.events,
    logs: db.logs.slice(0, 80),
    settings: db.settings,
    catalogCount: CATALOG.length,
    agentJobs: (db.agentJobs || []).slice(0, 40).map((j) => {
      ensureSegments(j);
      return j;
    }),
    grok: xaiReady(),
    github: githubReady(),
    files: filesReady(),
    me: { id: a.u.id, username: a.u.username, email: a.u.email },
  });
}

export async function POST(req: Request) {
  const a = await admin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 401 });
  const { db, u } = a;
  const body = await req.json().catch(() => ({}));
  const op = String(body.op || "");
  const target = findUser(db, String(body.userId || ""));

  if (op === "ban" && target) {
    target.bannedUntil = new Date(Date.now() + (Number(body.hours) || 24) * 3600_000).toISOString();
    target.banReason = String(body.reason || "Suspended");
    log(db, "mod", `${u.username} banned ${target.username}`);
  }
  if (op === "unban" && target) {
    target.bannedUntil = undefined;
    target.banReason = undefined;
  }
  if (op === "mute" && target) {
    target.mutedUntil = new Date(Date.now() + (Number(body.hours) || 6) * 3600_000).toISOString();
  }
  if (op === "grant" && target) {
    target.coins += Math.max(0, Number(body.coins) || 0);
    log(db, "econ", `${u.username} granted ${body.coins} to ${target.username}`);
  }
  if (op === "role" && target) {
    target.role = body.role === "admin" ? "admin" : body.role === "mod" ? "mod" : "user";
  }
  if (op === "close-report") {
    const r = db.reports.find((x) => x.id === body.reportId);
    if (r) r.status = "closed";
  }
  if (op === "kill-ad") {
    const ad = db.ads.find((x) => x.id === body.adId);
    if (ad) ad.status = "removed";
  }
  if (op === "settings") {
    db.settings = { ...db.settings, ...body.settings };
  }
  if (op === "event") {
    db.events.push({
      id: crypto.randomUUID(),
      title: String(body.title || "Event"),
      roomId: String(body.roomId || "public-lobby"),
      startsAt: String(body.startsAt || new Date().toISOString()),
      endsAt: String(body.endsAt || new Date(Date.now() + 864e5).toISOString()),
      desc: String(body.desc || ""),
      reward: Number(body.reward) || 0,
    });
  }
  saveDB(db);
  return NextResponse.json({ ok: true });
}
