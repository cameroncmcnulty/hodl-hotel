import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { BACKPACK_SLOTS, STARTER_COINS, TREASURY_WALLET } from "./constants";
import { FREE_LAYOUT_IDS } from "./layouts";
import type { DB, Occupant, ChatLine, Room, User } from "./types";
import { seedPublicRooms } from "./seed";

function resolveDataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  for (const dir of ["/data", "/mnt/data"]) {
    try {
      if (existsSync(dir)) return dir;
    } catch {
      /* */
    }
  }
  return join(process.cwd(), "data");
}

const dataDir = resolveDataDir();
const FILES = [
  join(dataDir, "db.json"),
  join(process.cwd(), "data", "db.json"),
  join("/tmp", "hodl-hotel-db.json"),
];

function empty(): DB {
  return {
    users: [],
    rooms: [],
    threads: [],
    trades: [],
    reports: [],
    ads: [],
    receipts: [],
    invoices: [],
    events: [],
    settings: {
      treasuryWallet: TREASURY_WALLET,
      chatEnabled: true,
      signupEnabled: true,
      maintenance: false,
      starterCoins: STARTER_COINS,
    },
    logs: [],
    agentJobs: [],
  };
}

type LiveRoom = { occupants: Occupant[]; chat: ChatLine[] };
type Live = { rooms: Record<string, LiveRoom> };
const g = globalThis as unknown as { __hodlDB?: DB; __hodlLive?: Live };
let cache: DB | null = g.__hodlDB || null;

function filePath() {
  for (const f of FILES) {
    try {
      mkdirSync(join(f, ".."), { recursive: true });
      return f;
    } catch {
      /* try next */
    }
  }
  return FILES[0];
}

export function loadDB(): DB {
  if (cache) return cache;
  const found: { f: string; db: DB }[] = [];
  for (const f of FILES) {
    try {
      if (existsSync(f)) found.push({ f, db: JSON.parse(readFileSync(f, "utf8")) as DB });
    } catch {
      /* */
    }
  }
  if (found.length) {
    found.sort((a, b) => (b.db.users?.length || 0) - (a.db.users?.length || 0));
    cache = found[0].db;
    for (const extra of found.slice(1)) {
      mergeUsers(cache, extra.db);
    }
    bootstrap(cache);
    g.__hodlDB = cache;
    return cache;
  }
  cache = empty();
  bootstrap(cache);
  saveDB(cache);
  return cache;
}

function mergeUsers(into: DB, from: DB) {
  const have = new Set(into.users.map((u) => u.id));
  for (const u of from.users || []) {
    if (!have.has(u.id)) {
      into.users.push(u);
      have.add(u.id);
    }
  }
  const haveR = new Set(into.rooms.map((r) => r.id));
  for (const r of from.rooms || []) {
    if (!haveR.has(r.id)) into.rooms.push(r);
  }
}

export function reloadDB(): DB {
  cache = null;
  return loadDB();
}

function bootstrap(db: DB) {
  if (!db.settings) db.settings = empty().settings;
  if (!db.settings.treasuryWallet) {
    db.settings.treasuryWallet = TREASURY_WALLET;
  }
  seedPublicRooms(db);
  if (!db.agentJobs) db.agentJobs = [];
  if (!db.invoices) db.invoices = [];
  for (const u of db.users) {
    if (!u.ownedLayoutIds?.length) u.ownedLayoutIds = [...FREE_LAYOUT_IDS];
  }
  const email = (process.env.ADMIN_EMAIL || "admin@hodlhotel.local").toLowerCase();
  const pass = process.env.ADMIN_PASSWORD || "change-me";
  let admin = db.users.find((u) => u.email === email);
  if (!admin) {
    admin = {
      id: "admin",
      email,
      username: "HotelDesk",
      passwordHash: bcrypt.hashSync(pass, 10),
      birthday: "1990-01-01",
      createdAt: new Date().toISOString(),
      role: "admin",
      coins: 50000,
      figure: { gender: 0, look: 0, skin: 2, hair: 1, hairColor: 3, top: 4, bottom: 2, shoes: 1, acc: 0 },
      friends: [],
      friendIn: [],
      friendOut: [],
      roomHistory: [],
      backpack: Array.from({ length: BACKPACK_SLOTS }, () => null),
      ownedRoomIds: [],
      ownedLayoutIds: [...FREE_LAYOUT_IDS],
      quests: {},
    };
    db.users.push(admin);
  } else {
    admin.role = "admin";
    if (pass && !bcrypt.compareSync(pass, admin.passwordHash)) {
      admin.passwordHash = bcrypt.hashSync(pass, 10);
    }
  }
}

export function saveDB(db: DB) {
  cache = db;
  g.__hodlDB = db;
  const json = JSON.stringify(db);
  let wrote = false;
  for (const f of FILES) {
    try {
      mkdirSync(join(f, ".."), { recursive: true });
      writeFileSync(f, json);
      wrote = true;
    } catch {
      /* try next */
    }
  }
  if (!wrote) {
    try {
      writeFileSync(filePath(), json);
    } catch {
      /* */
    }
  }
}

export function log(db: DB, kind: string, text: string) {
  db.logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), kind, text });
  db.logs = db.logs.slice(0, 400);
}

export function publicUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export function findUser(db: DB, id: string) {
  return db.users.find((u) => u.id === id);
}

export function findRoom(db: DB, id: string) {
  return db.rooms.find((r) => r.id === id);
}

export function persistInfo() {
  const file = join(dataDir, "db.json");
  return {
    dataDir,
    volumeMounted: existsSync("/data") || existsSync("/mnt/data"),
    dbFile: existsSync(file),
  };
}

function live(): Live {
  if (!g.__hodlLive) g.__hodlLive = { rooms: {} };
  return g.__hodlLive;
}

export function liveRoom(roomId: string): LiveRoom {
  const L = live();
  if (!L.rooms[roomId]) L.rooms[roomId] = { occupants: [], chat: [] };
  return L.rooms[roomId];
}

export function dropOccupant(userId: string) {
  const L = live();
  for (const r of Object.values(L.rooms)) {
    r.occupants = r.occupants.filter((o) => o.userId !== userId);
  }
}

export function pruneLive() {
  const now = Date.now();
  const L = live();
  for (const id of Object.keys(L.rooms)) {
    L.rooms[id].occupants = L.rooms[id].occupants.filter((o) => now - o.lastBeat < 45000);
  }
}

export function occupantCount(roomId: string) {
  pruneLive();
  return liveRoom(roomId).occupants.length;
}

export function roomPreview(r: Room) {
  return {
    id: r.id,
    name: r.name,
    ownerId: r.ownerId,
    layoutId: r.layoutId,
    visibility: r.visibility,
    users: occupantCount(r.id),
    maxUsers: r.maxUsers,
    lastActiveAt: r.lastActiveAt,
    publicKey: r.publicKey,
  };
}
