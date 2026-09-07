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
    id: "hz_sofa",
    name: "Club sofa",
    desc: "Three-seat velvet couch.",
    category: "seating",
    price: 0,
    w: 3,
    d: 1,
    h: 1.2,
    rot4: true,
    rarity: "common",
    slot: "floor",
    sittable: true,
    hotelOnly: true,
    shape: "sofa",
    colors: { top: "#7a4dff", left: "#4a2a86", right: "#2a1658", accent: "#ff6bd6" },
  },
  {
    id: "hz_table",
    name: "Glow table",
    desc: "Low club table.",
    category: "tables",
    price: 0,
    w: 1,
    d: 2,
    h: 0.55,
    rot4: true,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    shape: "table",
    colors: { top: "#5ee4f5", left: "#2a6b80", right: "#163848", accent: "#ff6bd6" },
  },
  {
    id: "hz_booth",
    name: "DJ booth",
    desc: "Booth with decks.",
    category: "electronics",
    price: 0,
    w: 3,
    d: 2,
    h: 1.15,
    rot4: false,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    shape: "dj",
    colors: { top: "#3b1860", left: "#1a0a28", right: "#2a1048", accent: "#14F195" },
  },
  {
    id: "hz_speaker",
    name: "Club stack",
    desc: "Tall speaker.",
    category: "electronics",
    price: 0,
    w: 1,
    d: 1,
    h: 1.8,
    rot4: false,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    shape: "juke",
    colors: { top: "#2a2438", left: "#141018", right: "#3a3148", accent: "#4fc3ff" },
  },
  {
    id: "hz_palm",
    name: "Club palm",
    desc: "Potted palm.",
    category: "plants",
    price: 0,
    w: 1,
    d: 1,
    h: 2.1,
    rot4: false,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    shape: "palm",
    colors: { top: "#22c55e", left: "#7c3aed", right: "#166534" },
  },
  {
    id: "hz_lamp",
    name: "Glow lamp",
    desc: "Floor lamp.",
    category: "lighting",
    price: 0,
    w: 1,
    d: 1,
    h: 1.7,
    rot4: false,
    rarity: "common",
    slot: "floor",
    hotelOnly: true,
    shape: "lamp",
    colors: { top: "#fce7f3", left: "#c084fc", right: "#fb7185" },
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
      spot("hz-sofa-w", "hz_sofa", 1, 5, 1),
      spot("hz-table-w", "hz_table", 2, 5, 0),
      spot("hz-lamp-w", "hz_lamp", 2, 4),
      spot("hz-palm-w0", "hz_palm", 1, 3),
      spot("hz-palm-w1", "hz_palm", 2, 8),
      spot("hz-sofa-e", "hz_sofa", 9, 6, 3),
      spot("hz-table-e", "hz_table", 10, 7, 0),
      spot("hz-lamp-e", "hz_lamp", 8, 10),
      spot("hz-palm-e0", "hz_palm", 10, 4),
      spot("hz-palm-e1", "hz_palm", 11, 8),
      spot("hz-spk-0", "hz_speaker", 10, 1),
      spot("hz-spk-1", "hz_speaker", 11, 1),
      spot("hz-palm-f0", "hz_palm", 3, 10),
      spot("hz-palm-f1", "hz_palm", 7, 10),
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
