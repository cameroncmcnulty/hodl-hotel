import type { DB, Placed, Room } from "./types";

function put(room: Room, catalogId: string, x: number, y: number, rot: 0 | 1 | 2 | 3 = 0, extra: Partial<Placed> = {}) {
  room.furniture.push({
    uid: `${room.id}-${catalogId}-${x}-${y}-${rot}`,
    catalogId,
    x,
    y,
    rot,
    ownerId: "hotel",
    ...extra,
  });
}

function ensure(db: DB, room: Room) {
  const i = db.rooms.findIndex((r) => r.id === room.id);
  if (i >= 0) {
    for (const f of room.furniture) {
      if (!db.rooms[i].furniture.some((x) => x.uid === f.uid)) db.rooms[i].furniture.push(f);
    }
    return;
  }
  db.rooms.push(room);
}

export function seedPublicRooms(db: DB) {
  const now = new Date().toISOString();

  const lobby: Room = {
    id: "public-lobby",
    name: "Grand Lobby",
    ownerId: null,
    layoutId: "grand_lobby",
    visibility: "public",
    furniture: [],
    maxUsers: 40,
    createdAt: now,
    lastActiveAt: now,
    publicKey: "lobby",
  };
  put(lobby, "fountain", 7, 7);
  put(lobby, "plant_palm", 2, 2);
  put(lobby, "plant_palm", 13, 2);
  put(lobby, "plant_palm", 2, 13);
  put(lobby, "plant_palm", 13, 13);
  put(lobby, "sofa_sunset", 4, 10, 0);
  put(lobby, "sofa_sunset", 10, 10, 2);
  put(lobby, "rug_large", 6, 4);
  put(lobby, "chandelier", 8, 4);
  put(lobby, "table_coffee", 5, 11);
  put(lobby, "table_coffee", 11, 11);
  put(lobby, "clock_block", 1, 8);
  put(lobby, "plant_palm", 5, 2);
  put(lobby, "plant_palm", 10, 2);
  put(lobby, "armchair_teal", 3, 12);
  put(lobby, "armchair_teal", 12, 12);
  put(lobby, "table_coffee", 8, 12);
  ensure(db, lobby);

  const pool: Room = {
    id: "public-pool",
    name: "Roof Pool",
    ownerId: null,
    layoutId: "roof_pool",
    visibility: "public",
    furniture: [],
    maxUsers: 30,
    createdAt: now,
    lastActiveAt: now,
    publicKey: "pool",
  };
  put(pool, "lounger_pool", 1, 6, 0);
  put(pool, "lounger_pool", 3, 6, 0);
  put(pool, "lounger_pool", 14, 6, 0);
  put(pool, "umbrella", 2, 7);
  put(pool, "umbrella", 15, 7);
  put(pool, "plant_palm", 0, 0);
  put(pool, "plant_palm", 17, 0);
  put(pool, "minibar", 8, 12);
  put(pool, "lounger_pool", 16, 6, 0);
  put(pool, "plant_palm", 8, 1);
  put(pool, "plant_palm", 10, 1);
  put(pool, "bean_gold", 6, 12);
  put(pool, "fountain", 9, 8);
  ensure(db, pool);

  const shill: Room = {
    id: "public-shill-zone",
    name: "SHILL ZONE",
    ownerId: null,
    layoutId: "shill_club",
    visibility: "public",
    furniture: [],
    maxUsers: 40,
    createdAt: now,
    lastActiveAt: now,
    publicKey: "shill",
  };
  put(shill, "disco_ball", 7, 3);
  put(shill, "dj_booth", 12, 6, 3);
  put(shill, "loveseat_violet", 1, 8, 0);
  put(shill, "loveseat_violet", 1, 11, 0);
  put(shill, "bar_table", 14, 10);
  put(shill, "bar_table", 14, 12);
  put(shill, "lamp_sol", 0, 1);
  put(shill, "lamp_sol", 15, 1);
  put(shill, "ad_board", 2, 0, 0, { adSlot: "shill-a" });
  put(shill, "ad_board", 6, 0, 0, { adSlot: "shill-b" });
  put(shill, "ad_board", 10, 0, 0, { adSlot: "shill-c" });
  put(shill, "ad_board", 13, 0, 0, { adSlot: "shill-d" });
  put(shill, "jukebox", 0, 6);
  put(shill, "rug_neon", 7, 8);
  put(shill, "sofa_sunset", 4, 10, 0);
  put(shill, "loveseat_violet", 8, 11, 2);
  put(shill, "bean_gold", 10, 8);
  put(shill, "plant_palm", 15, 13);
  put(shill, "disco_ball", 5, 4);
  put(shill, "lamp_floor", 3, 13);
  put(shill, "armchair_teal", 12, 12);
  ensure(db, shill);

  const cook: Room = {
    id: "public-cook-room",
    name: "The Cook Room",
    ownerId: null,
    layoutId: "cook_lab",
    visibility: "public",
    furniture: [],
    maxUsers: 28,
    createdAt: now,
    lastActiveAt: now,
    publicKey: "cook",
  };
  put(cook, "table_dining", 5, 5);
  put(cook, "bean_gold", 4, 4);
  put(cook, "bean_gold", 8, 4);
  put(cook, "bean_gold", 4, 8);
  put(cook, "bean_gold", 8, 8);
  put(cook, "computer", 1, 1);
  put(cook, "table_desk", 1, 2);
  put(cook, "plant_flower", 12, 1);
  put(cook, "plant_palm", 12, 10);
  put(cook, "lamp_floor", 0, 6);
  put(cook, "ad_board", 4, 0, 0, { adSlot: "cook-a" });
  put(cook, "ad_board", 8, 0, 0, { adSlot: "cook-b" });
  put(cook, "rug_small", 6, 6);
  put(cook, "statue_sol", 11, 5);
  ensure(db, cook);

  const arcade: Room = {
    id: "public-arcade",
    name: "Signal Arcade",
    ownerId: null,
    layoutId: "pixel_arcade",
    visibility: "public",
    furniture: [],
    maxUsers: 24,
    createdAt: now,
    lastActiveAt: now,
    publicKey: "arcade",
  };
  put(arcade, "arcade_cab", 2, 2);
  put(arcade, "arcade_cab", 4, 2);
  put(arcade, "arcade_cab", 6, 2);
  put(arcade, "dice_machine", 10, 6);
  put(arcade, "dice_machine", 12, 6);
  put(arcade, "chess_table", 3, 8);
  put(arcade, "stool_mint", 3, 9);
  put(arcade, "rug_neon", 7, 4);
  put(arcade, "jukebox", 0, 10);
  ensure(db, arcade);

  if (!db.events.length) {
    const start = new Date();
    const end = new Date(Date.now() + 7 * 864e5);
    db.events.push({
      id: "weekend-shill",
      title: "Neon Hour",
      roomId: "public-shill-zone",
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      desc: "Official hotel mixer in SHILL ZONE. Dance, meet builders, no pitch-slapping.",
      reward: 40,
    });
  }

  const defaults = [
    {
      id: "ad-sol-default",
      slotId: "shill-a",
      roomId: "public-shill-zone",
      userId: "hotel",
      image: "builtin:sol",
      plan: "month",
      start: now,
      end: new Date(Date.now() + 365 * 864e5).toISOString(),
      status: "live" as const,
    },
    {
      id: "ad-btc-default",
      slotId: "shill-b",
      roomId: "public-shill-zone",
      userId: "hotel",
      image: "builtin:btc",
      plan: "month",
      start: now,
      end: new Date(Date.now() + 365 * 864e5).toISOString(),
      status: "live" as const,
    },
  ];
  for (const a of defaults) {
    if (!db.ads.some((x) => x.id === a.id)) db.ads.push(a);
  }
}
