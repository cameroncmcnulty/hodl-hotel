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

export const CATALOG: FurnDef[] = [];
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

export function hotelFurniture(_layoutId: string) {
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
