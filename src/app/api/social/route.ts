import { NextResponse } from "next/server";
import { moderate } from "@/lib/moderate";
import { sessionUserId } from "@/lib/session";
import { findUser, liveRoom, loadDB, occupantCount, publicUser, saveDB } from "@/lib/store";

export async function GET() {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });

  const presence = (fid: string) => {
    for (const r of db.rooms) {
      const occ = liveRoom(r.id).occupants.find((o) => o.userId === fid);
      if (occ && Date.now() - occ.lastBeat < 20000) {
        return { online: true, roomId: r.id, roomName: r.name };
      }
    }
    return { online: false as const };
  };

  const pack = (fid: string) => {
    const f = findUser(db, fid);
    if (!f) return null;
    return { id: f.id, username: f.username, figure: f.figure, ...presence(fid) };
  };

  const threads = db.threads
    .filter((t) => t.a === id || t.b === id)
    .map((t) => {
      const other = t.a === id ? t.b : t.a;
      const last = t.messages[t.messages.length - 1];
      const unread = t.messages.filter((m) => m.from !== id && !m.read).length;
      return { id: t.id, other: pack(other), last, unread, messages: t.messages.slice(-80) };
    });

  return NextResponse.json({
    friends: u.friends.map(pack).filter(Boolean),
    incoming: u.friendIn.map(pack).filter(Boolean),
    outgoing: u.friendOut.map(pack).filter(Boolean),
    threads,
  });
}

export async function POST(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  if (!u) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const op = String(body.op || "");

  if (op === "request") {
    const t = db.users.find(
      (x) => x.username.toLowerCase() === String(body.username || "").toLowerCase() || x.id === body.userId
    );
    if (!t || t.id === id) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (u.friends.includes(t.id)) return NextResponse.json({ error: "Already friends" }, { status: 400 });
    if (!u.friendOut.includes(t.id)) u.friendOut.push(t.id);
    if (!t.friendIn.includes(id)) t.friendIn.push(id);
    saveDB(db);
    return NextResponse.json({ ok: true });
  }

  if (op === "accept") {
    const fid = String(body.userId || "");
    if (!u.friendIn.includes(fid)) return NextResponse.json({ error: "No request" }, { status: 400 });
    const t = findUser(db, fid);
    if (!t) return NextResponse.json({ error: "Gone" }, { status: 404 });
    u.friendIn = u.friendIn.filter((x) => x !== fid);
    t.friendOut = t.friendOut.filter((x) => x !== id);
    if (!u.friends.includes(fid)) u.friends.push(fid);
    if (!t.friends.includes(id)) t.friends.push(id);
    const q = u.quests.friendly || { progress: 0, done: false };
    if (!q.done) {
      q.done = true;
      q.progress = 1;
      u.coins += 30;
      u.quests.friendly = q;
    }
    saveDB(db);
    return NextResponse.json({ ok: true });
  }

  if (op === "decline" || op === "cancel") {
    const fid = String(body.userId || "");
    u.friendIn = u.friendIn.filter((x) => x !== fid);
    u.friendOut = u.friendOut.filter((x) => x !== fid);
    const t = findUser(db, fid);
    if (t) {
      t.friendIn = t.friendIn.filter((x) => x !== id);
      t.friendOut = t.friendOut.filter((x) => x !== id);
    }
    saveDB(db);
    return NextResponse.json({ ok: true });
  }

  if (op === "dm") {
    const fid = String(body.userId || "");
    if (!u.friends.includes(fid)) return NextResponse.json({ error: "Friends only" }, { status: 400 });
    const { text } = moderate(String(body.text || "").slice(0, 240));
    if (!text.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });
    let th = db.threads.find((t) => (t.a === id && t.b === fid) || (t.a === fid && t.b === id));
    if (!th) {
      th = { id: crypto.randomUUID(), a: id, b: fid, messages: [] };
      db.threads.push(th);
    }
    th.messages.push({ id: crypto.randomUUID(), from: id, text, at: new Date().toISOString(), read: false });
    th.messages = th.messages.slice(-200);
    saveDB(db);
    return NextResponse.json({ ok: true, thread: th });
  }

  if (op === "read") {
    const th = db.threads.find((t) => t.id === body.threadId);
    if (th) for (const m of th.messages) if (m.from !== id) m.read = true;
    saveDB(db);
    return NextResponse.json({ ok: true });
  }

  if (op === "report") {
    db.reports.unshift({
      id: crypto.randomUUID(),
      fromId: id,
      targetId: String(body.userId || ""),
      reason: String(body.reason || "unspecified").slice(0, 200),
      at: new Date().toISOString(),
      status: "open",
    });
    saveDB(db);
    return NextResponse.json({ ok: true });
  }

  void occupantCount;
  void publicUser;
  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
