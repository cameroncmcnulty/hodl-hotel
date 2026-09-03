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

export function hotelFurniture(layoutId: string) {
  if (layoutId !== "grand_lobby") return [] as { uid: string; catalogId: string; x: number; y: number; rot: 0 | 1 | 2 | 3; ownerId: string }[];
  return [
    { uid: "test-stool-a", catalogId: "stool_mint", x: 6, y: 8, rot: 0 as const, ownerId: "hotel" },
    { uid: "test-stool-b", catalogId: "stool_mint", x: 8, y: 8, rot: 0 as const, ownerId: "hotel" },
    { uid: "test-stool-c", catalogId: "stool_mint", x: 10, y: 8, rot: 0 as const, ownerId: "hotel" },
    { uid: "test-chair-a", catalogId: "chair_coral", x: 6, y: 10, rot: 0 as const, ownerId: "hotel" },
    { uid: "test-chair-b", catalogId: "chair_coral", x: 8, y: 10, rot: 0 as const, ownerId: "hotel" },
    { uid: "test-chair-c", catalogId: "chair_coral", x: 10, y: 10, rot: 0 as const, ownerId: "hotel" },
  ];
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
