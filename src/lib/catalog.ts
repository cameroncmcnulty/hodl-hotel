export type FurnUse = "dice" | "teleport" | "frame" | "dance" | "ad" | "arcade" | "sit" | "ticker";
export type Rarity = "common" | "uncommon" | "rare" | "elite" | "gold" | "crypto";

export type FurnDef = {
  id: string;
  name: string;
  desc: string;
  category: string;
  price: number;
  w: number;
  d: number;
  h: number;
  rot4?: boolean;
  rare?: boolean;
  rarity?: Rarity;
  slot?: "floor" | "wall";
  walkable?: boolean;
  sittable?: boolean;
  hotelOnly?: boolean;
  /** Occupancy only — baked into a room painting, never drawn. */
  hidden?: boolean;
  use?: FurnUse;
  layable?: boolean;
  finish?: "paper" | "floor";
  shape: string;
  colors: { top: string; left: string; right: string; accent?: string };
};

export const CATALOG: FurnDef[] = [
  {
    id: "stool_mint",
    name: "Mint stool",
    desc: "Artist test seat. 1 tile. Sit on it.",
    category: "seating",
    price: 0,
    w: 1,
    d: 1,
    h: 1.2,
    rot4: false,
    rarity: "common",
    slot: "floor",
    sittable: true,
    shape: "stool",
    colors: { top: "#b5efc9", left: "#80bd9b", right: "#609780" },
  },
  {
    id: "chair_coral",
    name: "Coral chair",
    desc: "Artist test chair. 1 tile. Sit on it.",
    category: "seating",
    price: 0,
    w: 1,
    d: 1,
    h: 1.4,
    rot4: false,
    rarity: "common",
    slot: "floor",
    sittable: true,
    shape: "chair",
    colors: { top: "#f1694f", left: "#9f4835", right: "#73331a" },
  },
  {
    id: "hz_seat",
    name: "Club sofa",
    desc: "Sittable club couch.",
    category: "seating",
    price: 0,
    w: 1,
    d: 1,
    h: 1.15,
    rot4: false,
    rarity: "common",
    slot: "floor",
    sittable: true,
    hotelOnly: true,
    hidden: true,
    shape: "sofa",
    colors: { top: "#7c4dff", left: "#4a2a78", right: "#2e1854" },
  },
  {
    id: "hz_block",
    name: "Club prop",
    desc: "Blocks a tile.",
    category: "decor",
    price: 0,
    w: 1,
    d: 1,
    h: 1.4,
    rot4: false,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    hidden: true,
    shape: "block",
    colors: { top: "#2a2038", left: "#1a1428", right: "#120e1c" },
  },
  {
    id: "hz_booth",
    name: "DJ booth",
    desc: "Blocks the booth.",
    category: "electronics",
    price: 0,
    w: 3,
    d: 2,
    h: 2.2,
    rot4: false,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    hidden: true,
    shape: "block",
    colors: { top: "#3b1860", left: "#1a0a28", right: "#120818" },
  },
];
export const HOTEL_FURN: FurnDef[] = [];

export const RARITY_TONE: Record<Rarity, string> = {
  common: "bg-white/15 text-white/70",
  uncommon: "bg-mint/20 text-mint",
  rare: "bg-sol/25 text-sol",
  elite: "bg-white/20 text-white",
  gold: "bg-gold/25 text-gold",
  crypto: "bg-orange-500/20 text-orange-300",
};

export type HotelSpot = { id: string; x: number; y: number; rot?: 0 | 1 | 2 | 3 };

export const HOTEL_SPOTS: Record<string, HotelSpot[]> = {};

function spot(uid: string, catalogId: string, x: number, y: number, rot: 0 | 1 | 2 | 3 = 0) {
  return { uid, catalogId, x, y, rot, ownerId: "hotel" };
}

export function hotelFurniture(layoutId: string) {
  if (layoutId === "grand_lobby") {
    return [
      spot("test-stool-a", "stool_mint", 6, 8),
      spot("test-stool-b", "stool_mint", 8, 8),
      spot("test-stool-c", "stool_mint", 10, 8),
      spot("test-chair-a", "chair_coral", 6, 10),
      spot("test-chair-b", "chair_coral", 8, 10),
      spot("test-chair-c", "chair_coral", 10, 10),
    ];
  }
  if (layoutId === "shill_club") {
    return [
      spot("hz-booth", "hz_booth", 4, 1),
      spot("hz-seat-l0", "hz_seat", 1, 5, 1),
      spot("hz-seat-l1", "hz_seat", 1, 6, 1),
      spot("hz-seat-l2", "hz_seat", 1, 7, 1),
      spot("hz-tbl-l0", "hz_block", 2, 5),
      spot("hz-tbl-l1", "hz_block", 2, 6),
      spot("hz-lamp-l", "hz_block", 1, 4),
      spot("hz-plant-l0", "hz_block", 2, 8),
      spot("hz-plant-l1", "hz_block", 0, 6),
      spot("hz-seat-r0", "hz_seat", 7, 1, 0),
      spot("hz-seat-r1", "hz_seat", 8, 1, 0),
      spot("hz-seat-r2", "hz_seat", 9, 1, 0),
      spot("hz-tbl-r0", "hz_block", 7, 2),
      spot("hz-tbl-r1", "hz_block", 8, 2),
      spot("hz-spk-0", "hz_block", 10, 1),
      spot("hz-spk-1", "hz_block", 10, 2),
      spot("hz-spk-2", "hz_block", 11, 2),
      spot("hz-plant-r0", "hz_block", 11, 4),
      spot("hz-plant-r1", "hz_block", 9, 3),
      spot("hz-plant-f0", "hz_block", 3, 10),
      spot("hz-plant-f1", "hz_block", 5, 10),
      spot("hz-lamp-f", "hz_block", 7, 9),
      spot("hz-plant-e0", "hz_block", 8, 11),
    ];
  }
  return [] as { uid: string; catalogId: string; x: number; y: number; rot: 0 | 1 | 2 | 3; ownerId: string }[];
}

export const CATS = [
  "seating",
  "beds",
  "tables",
  "lighting",
  "electronics",
  "plants",
  "rugs",
  "kitchen",
  "structure",
  "crypto",
  "decor",
  "games",
  "utility",
  "frames",
  "outdoor",
  "finish",
] as const;

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
  elite: "elite",
  gold: "gold",
  crypto: "crypto",
};

export function furn(id: string) {
  return CATALOG.find((f) => f.id === id);
}

export function footprint(def: FurnDef, rot: 0 | 1 | 2 | 3) {
  const swap = rot === 1 || rot === 3;
  return { w: swap ? def.d : def.w, d: swap ? def.w : def.d };
}

export function visualFill(_def: FurnDef) {
  return 1;
}
