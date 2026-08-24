import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { BACKPACK_SLOTS, STARTER_COINS, TREASURY_WALLET } from "./constants";
import type { DB, Occupant, ChatLine, Room, User } from "./types";
import { seedPublicRooms } from "./seed";

const FILES = [join(process.cwd(), "data", "db.json"), join("/tmp", "hodl-hotel-db.json")];

function empty(): DB {
  return {
    users: [],
    rooms: [],
    threads: [],
    trades: [],
    reports: [],
    ads: [],
    receipts: [],
    events: [],
    settings: {
      treasuryWallet: TREASURY_WALLET,
      chatEnabled: true,
      signupEnabled: true,
      maintenance: false,
      starterCoins: STARTER_COINS,
    },
    logs: [],
  };
}

let cache: DB | null = null;

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
  for (const f of FILES) {
    try {
      if (existsSync(f)) {
        cache = JSON.parse(readFileSync(f, "utf8")) as DB;
        bootstrap(cache);
        return cache;
      }
    } catch {
      /* */
    }
  }
  cache = empty();
  bootstrap(cache);
  saveDB(cache);
  return cache;
}

function bootstrap(db: DB) {
  if (!db.settings) db.settings = empty().settings;
  if (!db.settings.treasuryWallet) {
    db.settings.treasuryWallet = TREASURY_WALLET;
  }
  seedPublicRooms(db);
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
      figure: { skin: 2, hair: 1, hairColor: 3, top: 4, bottom: 2, shoes: 1, acc: 0 },
      friends: [],
      friendIn: [],
      friendOut: [],
      roomHistory: [],
      backpack: Array.from({ length: BACKPACK_SLOTS }, () => null),
      ownedRoomIds: [],
      quests: {},
    };
    db.users.push(admin);
  } else {
    admin.role = "admin";
  }
}

export function saveDB(db: DB) {
  cache = db;
  const json = JSON.stringify(db);
  const f = filePath();
  try {
    writeFileSync(f, json);
  } catch {
    try {
      writeFileSync(FILES[1], json);
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

type LiveRoom = { occupants: Occupant[]; chat: ChatLine[] };

type Live = { rooms: Record<string, LiveRoom> };

const g = globalThis as unknown as { __hodlLive?: Live };
function live(): Live {
  if (!g.__hodlLive) g.__hodlLive = { rooms: {} };
  return g.__hodlLive;
}

export function liveRoom(roomId: string): LiveRoom {
  const L = live();
  if (!L.rooms[roomId]) L.rooms[roomId] = { occupants: [], chat: [] };
  return L.rooms[roomId];
}

export function pruneLive() {
  const now = Date.now();
  const L = live();
  for (const id of Object.keys(L.rooms)) {
    L.rooms[id].occupants = L.rooms[id].occupants.filter((o) => now - o.lastBeat < 20000);
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
