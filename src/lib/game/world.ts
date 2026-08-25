import { BACKPACK_SLOTS, CHAT_MAX, HISTORY_LIMIT, TRADE_SLOTS } from "../constants";
import { furn, footprint } from "../catalog";
import { FREE_LAYOUT_IDS, layoutById, walkable, isDance } from "../layouts";
import { moderate } from "../moderate";
import { dropOccupant, findRoom, findUser, liveRoom, loadDB, log, occupantCount, pruneLive, saveDB } from "../store";
import type { Item, Occupant, Placed, User } from "../types";
import { astar, blockedSet, dirTowards } from "./path";

export type Action =
  | { type: "join"; roomId: string; password?: string }
  | { type: "leave" }
  | { type: "walk"; x: number; y: number }
  | { type: "chat"; text: string }
  | { type: "ping"; x?: number; y?: number; dir?: Occupant["dir"]; dance?: boolean }
  | { type: "place"; uid: string; x: number; y: number; rot: 0 | 1 | 2 | 3 }
  | { type: "pickup"; uid: string }
  | { type: "rotate"; uid: string }
  | { type: "use"; uid: string }
  | { type: "dance"; on?: boolean }
  | { type: "linkPads"; a: string; b: string }
  | { type: "setFrame"; uid: string; nftMint?: string; nftUrl?: string }
  | { type: "setLayout"; layoutId: string };

function emptyOcc(u: User, x: number, y: number): Occupant {
  return {
    userId: u.id,
    username: u.username,
    figure: u.figure,
    x,
    y,
    z: 0,
    dir: 0,
    path: [],
    lastBeat: Date.now(),
  };
}

function dropFromAllRooms(userId: string) {
  dropOccupant(userId);
}

function firstFreeSlot(u: User) {
  return u.backpack.findIndex((s) => !s);
}

function canPlace(room: { layoutId: string; furniture: Placed[] }, defId: string, x: number, y: number, rot: 0 | 1 | 2 | 3) {
  const def = furn(defId);
  if (!def) return false;
  const layout = layoutById(room.layoutId);
  const { w, d } = footprint(def, rot);
  for (let dy = 0; dy < d; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (!walkable(layout, x + dx, y + dy) && def.slot === "floor") return false;
    }
  }
  if (def.walkable || def.slot === "wall") return true;
  const blocked = blockedSet(room.layoutId, room.furniture);
  for (let dy = 0; dy < d; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (blocked.has(`${x + dx},${y + dy}`)) return false;
    }
  }
  return true;
}

export function snapshot(roomId: string, viewerId: string) {
  pruneLive();
  const db = loadDB();
  const room = findRoom(db, roomId);
  if (!room) return { error: "Room missing" };
  const live = liveRoom(roomId);
  const now = Date.now();
  const ads = db.ads.filter((a) => a.roomId === roomId && a.status === "live" && new Date(a.end).getTime() > now);
  const occ = live.occupants.find((o) => o.userId === viewerId);
  return {
    room,
    occupants: live.occupants,
    chat: live.chat.slice(-60),
    ads,
    you: occ,
    users: occupantCount(roomId),
    serverTime: now,
  };
}

export function applyAction(userId: string, action: Action) {
  const db = loadDB();
  const u = findUser(db, userId);
  if (!u) return { error: "Not signed in" };
  if (u.bannedUntil && new Date(u.bannedUntil) > new Date()) return { error: "Account suspended" };

  pruneLive();

  const current = (): { roomId: string; occ: Occupant } | null => {
    const g = (globalThis as unknown as { __hodlLive?: { rooms: Record<string, { occupants: Occupant[] }> } }).__hodlLive;
    if (!g) return null;
    for (const [roomId, r] of Object.entries(g.rooms)) {
      const occ = r.occupants.find((o) => o.userId === userId);
      if (occ) return { roomId, occ };
    }
    return null;
  };

  if (action.type === "join") {
    const room = findRoom(db, action.roomId);
    if (!room) return { error: "Room not found" };
    if (room.visibility === "locked" && room.ownerId !== userId) {
      const friendInside = liveRoom(room.id).occupants.some((o) => u.friends.includes(o.userId));
      if (!friendInside && action.password !== room.password) return { error: "Room is locked" };
    }
    if (occupantCount(room.id) >= room.maxUsers && !liveRoom(room.id).occupants.some((o) => o.userId === userId)) {
      return { error: "Room is full" };
    }
    const already = liveRoom(room.id).occupants.find((o) => o.userId === userId);
    if (already) {
      already.lastBeat = Date.now();
      room.lastActiveAt = new Date().toISOString();
      return snapshot(room.id, userId);
    }
    dropFromAllRooms(userId);
    const layout = layoutById(room.layoutId);
    const live = liveRoom(room.id);
    live.occupants.push(emptyOcc(u, layout.spawn.x, layout.spawn.y));
    room.lastActiveAt = new Date().toISOString();
    u.roomHistory = [{ roomId: room.id, at: room.lastActiveAt }, ...u.roomHistory.filter((h) => h.roomId !== room.id)].slice(
      0,
      HISTORY_LIMIT
    );
    bumpQuest(u, "social", room.ownerId ? 0 : 1);
    saveDB(db);
    return snapshot(room.id, userId);
  }

  const here = current();
  if (!here) {
    if (action.type === "ping") return { ok: true, occupants: [] as Occupant[] };
    return { error: "Join a room first" };
  }

  const room = findRoom(db, here.roomId)!;
  const live = liveRoom(here.roomId);
  const occ = live.occupants.find((o) => o.userId === userId);
  if (!occ) return { error: "Not in room" };
  occ.lastBeat = Date.now();
  occ.username = u.username;
  occ.figure = u.figure;

  if (action.type === "leave") {
    live.occupants = live.occupants.filter((o) => o.userId !== userId);
    saveDB(db);
    return { ok: true };
  }

  if (action.type === "ping") {
    if (typeof action.x === "number") occ.x = action.x;
    if (typeof action.y === "number") occ.y = action.y;
    if (action.dir !== undefined) occ.dir = action.dir;
    if (action.dance !== undefined) occ.dance = action.dance;
    if (occ.path.length) {
      const n = occ.path[0];
      occ.dir = dirTowards(Math.round(occ.x), Math.round(occ.y), n.x, n.y);
      occ.x = n.x;
      occ.y = n.y;
      occ.path = occ.path.slice(1);
      occ.sitUid = undefined;
      const stepped = room.furniture.find((p) => p.x === n.x && p.y === n.y && furn(p.catalogId)?.use === "teleport");
      if (stepped?.pairId) {
        const dest = db.rooms
          .flatMap((r) => r.furniture.map((f) => ({ r, f })))
          .find(({ f }) => f.pairId === stepped.pairId && f.uid !== stepped.uid);
        if (dest) {
          dropFromAllRooms(userId);
          const L = liveRoom(dest.r.id);
          L.occupants.push(emptyOcc(u, dest.f.x, dest.f.y));
          u.roomHistory = [{ roomId: dest.r.id, at: new Date().toISOString() }, ...u.roomHistory].slice(0, HISTORY_LIMIT);
          saveDB(db);
          return snapshot(dest.r.id, userId);
        }
      }
    }
    if (isDance(layoutById(room.layoutId), Math.round(occ.x), Math.round(occ.y))) occ.dance = true;
    return snapshot(here.roomId, userId);
  }

  if (action.type === "walk") {
    const layout = layoutById(room.layoutId);
    if (!walkable(layout, action.x, action.y)) return snapshot(here.roomId, userId);
    const path = astar(room.layoutId, room.furniture, Math.round(occ.x), Math.round(occ.y), action.x, action.y);
    occ.path = path;
    occ.sitUid = undefined;
    const sit = room.furniture.find((p) => {
      const def = furn(p.catalogId);
      return def?.sittable && p.x === action.x && p.y === action.y;
    });
    if (sit) occ.sitUid = sit.uid;
    return snapshot(here.roomId, userId);
  }

  if (action.type === "chat") {
    if (u.mutedUntil && new Date(u.mutedUntil) > new Date()) return { error: "You are muted" };
    if (!db.settings.chatEnabled) return { error: "Chat is paused" };
    const { text } = moderate((action.text || "").slice(0, CHAT_MAX));
    if (!text.trim()) return snapshot(here.roomId, userId);
    occ.chat = { text, at: Date.now() };
    live.chat.push({
      id: crypto.randomUUID(),
      userId,
      username: u.username,
      text,
      at: Date.now(),
      kind: "chat",
    });
    live.chat = live.chat.slice(-80);
    bumpQuest(u, "chat", 1);
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  if (action.type === "place") {
    if (room.ownerId !== userId && room.ownerId !== null) return { error: "Only the host can decorate" };
    if (room.ownerId === null) return { error: "Hotel rooms are curated" };
    const slot = u.backpack.findIndex((s) => s?.uid === action.uid);
    const item = slot >= 0 ? u.backpack[slot] : null;
    if (!item) return { error: "Item not in backpack" };
    const def = furn(item.catalogId);
    if (!def) return { error: "Unknown item" };
    if (!canPlace(room, item.catalogId, action.x, action.y, action.rot)) return { error: "Can't place there" };
    room.furniture.push({
      uid: item.uid,
      catalogId: item.catalogId,
      x: action.x,
      y: action.y,
      rot: action.rot,
      ownerId: userId,
      pairId: item.pairId,
      nftMint: item.nftMint,
      nftUrl: item.nftUrl,
    });
    u.backpack[slot] = null;
    bumpQuest(u, "decorator", 1);
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  if (action.type === "pickup") {
    const p = room.furniture.find((f) => f.uid === action.uid);
    if (!p) return { error: "Missing furniture" };
    if (p.ownerId !== userId && room.ownerId !== userId) return { error: "Not yours" };
    if (room.ownerId === null) return { error: "Hotel furniture stays" };
    const free = firstFreeSlot(u);
    if (free < 0) return { error: "Backpack full (30)" };
    u.backpack[free] = {
      uid: p.uid,
      catalogId: p.catalogId,
      pairId: p.pairId,
      nftMint: p.nftMint,
      nftUrl: p.nftUrl,
    };
    room.furniture = room.furniture.filter((f) => f.uid !== p.uid);
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  if (action.type === "rotate") {
    const p = room.furniture.find((f) => f.uid === action.uid);
    if (!p || (p.ownerId !== userId && room.ownerId !== userId)) return { error: "Can't rotate" };
    p.rot = ((p.rot + 1) % 4) as 0 | 1 | 2 | 3;
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  if (action.type === "use") {
    const p = room.furniture.find((f) => f.uid === action.uid);
    if (!p) return { error: "Nothing there" };
    const def = furn(p.catalogId);
    if (def?.use === "dice") {
      const n = 1 + Math.floor(Math.random() * 6);
      live.chat.push({
        id: crypto.randomUUID(),
        userId,
        username: u.username,
        text: `rolled a ${n}`,
        at: Date.now(),
        kind: "roll",
      });
      occ.chat = { text: `🎲 ${n}`, at: Date.now() };
      saveDB(db);
      return snapshot(here.roomId, userId);
    }
    if (def?.sittable) {
      occ.x = p.x;
      occ.y = p.y;
      occ.sitUid = p.uid;
      occ.path = [];
      return snapshot(here.roomId, userId);
    }
    if (def?.use === "dance") {
      occ.dance = !occ.dance;
      return snapshot(here.roomId, userId);
    }
    if (def?.use === "teleport" && p.pairId) {
      return applyAction(userId, { type: "walk", x: p.x, y: p.y });
    }
    return snapshot(here.roomId, userId);
  }

  if (action.type === "dance") {
    occ.dance = action.on ?? !occ.dance;
    return snapshot(here.roomId, userId);
  }

  if (action.type === "linkPads") {
    const a = room.furniture.find((f) => f.uid === action.a);
    const bRooms = db.rooms.filter((r) => r.ownerId === userId);
    const b = bRooms.flatMap((r) => r.furniture).find((f) => f.uid === action.b);
    if (!a || !b) return { error: "Need two pads you own" };
    if (furn(a.catalogId)?.use !== "teleport" || furn(b.catalogId)?.use !== "teleport") return { error: "Not pads" };
    const pairId = crypto.randomUUID();
    a.pairId = pairId;
    b.pairId = pairId;
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  if (action.type === "setLayout") {
    if (room.ownerId !== userId) return { error: "Only the host can change the floor plan" };
    if (room.ownerId === null) return { error: "Hotel rooms stay as built" };
    const next = layoutById(action.layoutId);
    if (!next) return { error: "Unknown plan" };
    if (!FREE_LAYOUT_IDS.includes(next.id) && !u.ownedLayoutIds?.includes(next.id)) {
      return { error: "Buy this floor plan in the shop first" };
    }
    const keep: Placed[] = [];
    for (const p of room.furniture) {
      const def = furn(p.catalogId);
      if (!def) continue;
      const { w, d } = footprint(def, p.rot);
      let ok = true;
      for (let dy = 0; dy < d && ok; dy++) {
        for (let dx = 0; dx < w; dx++) {
          if (!walkable(next, p.x + dx, p.y + dy) && def.slot !== "wall") ok = false;
        }
      }
      if (ok) keep.push(p);
      else {
        const free = firstFreeSlot(u);
        if (free < 0) return { error: "Backpack full — pick up extra furniture first" };
        u.backpack[free] = {
          uid: p.uid,
          catalogId: p.catalogId,
          pairId: p.pairId,
          nftMint: p.nftMint,
          nftUrl: p.nftUrl,
        };
      }
    }
    room.furniture = keep;
    room.layoutId = next.id;
    if (!walkable(next, Math.round(occ.x), Math.round(occ.y))) {
      occ.x = next.spawn.x;
      occ.y = next.spawn.y;
      occ.path = [];
    }
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  if (action.type === "setFrame") {
    const p = room.furniture.find((f) => f.uid === action.uid);
    if (!p || p.ownerId !== userId) return { error: "Not your frame" };
    if (furn(p.catalogId)?.use !== "frame") return { error: "Not a frame" };
    p.nftMint = action.nftMint;
    p.nftUrl = action.nftUrl;
    saveDB(db);
    return snapshot(here.roomId, userId);
  }

  void BACKPACK_SLOTS;
  void TRADE_SLOTS;
  void log;
  return snapshot(here.roomId, userId);
}

function bumpQuest(u: User, id: string, add: number) {
  if (add <= 0) return;
  const q = u.quests[id] || { progress: 0, done: false };
  if (q.done) return;
  q.progress += add;
  const need = id === "decorator" ? 3 : 1;
  if (q.progress >= need) {
    q.done = true;
    u.coins += id === "decorator" ? 40 : 25;
  }
  u.quests[id] = q;
}

export { canPlace };
