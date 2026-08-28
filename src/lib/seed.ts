import type { DB, Room } from "./types";
import { hotelFurniture } from "./catalog";

function ensure(db: DB, room: Room) {
  const i = db.rooms.findIndex((r) => r.id === room.id);
  if (i >= 0) {
    db.rooms[i].layoutId = room.layoutId;
    db.rooms[i].name = room.name;
    db.rooms[i].maxUsers = room.maxUsers;
    db.rooms[i].visibility = room.visibility;
    db.rooms[i].publicKey = room.publicKey;
    db.rooms[i].furniture = room.furniture;
    return;
  }
  db.rooms.push(room);
}

function hotelPublic(
  id: string,
  name: string,
  layoutId: string,
  publicKey: string,
  maxUsers: number,
  now: string
): Room {
  return {
    id,
    name,
    ownerId: null,
    layoutId,
    visibility: "public",
    furniture: hotelFurniture(layoutId),
    maxUsers,
    createdAt: now,
    lastActiveAt: now,
    publicKey,
  };
}

export function seedPublicRooms(db: DB) {
  const now = new Date().toISOString();

  ensure(db, hotelPublic("public-lobby", "Grand Lobby", "grand_lobby", "lobby", 40, now));
  ensure(db, hotelPublic("public-pool", "Roof Pool", "roof_pool", "pool", 30, now));
  ensure(db, hotelPublic("public-shill-zone", "SHILL ZONE", "shill_club", "shill", 40, now));
  ensure(db, hotelPublic("public-cook-room", "The Cook Room", "cook_lab", "cook", 28, now));
  ensure(db, hotelPublic("public-arcade", "Signal Arcade", "pixel_arcade", "arcade", 24, now));

  for (const r of db.rooms) {
    if (r.ownerId === null) r.furniture = hotelFurniture(r.layoutId);
  }

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
}
