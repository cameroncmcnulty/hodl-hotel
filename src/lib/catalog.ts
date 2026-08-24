export type FurnUse = "dice" | "teleport" | "frame" | "dance" | "ad" | "arcade" | "sit";

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
  slot?: "floor" | "wall";
  walkable?: boolean;
  sittable?: boolean;
  use?: FurnUse;
  shape: string;
  colors: { top: string; left: string; right: string; accent?: string };
};

const F = (partial: FurnDef): FurnDef => ({ rot4: true, ...partial, slot: partial.slot ?? "floor" });

export const CATALOG: FurnDef[] = [
  F({ id: "stool_mint", name: "Mint Stool", desc: "A chunky round perch.", category: "seating", price: 12, w: 1, d: 1, h: 1, sittable: true, use: "sit", shape: "stool", colors: { top: "#14F195", left: "#0d9b6a", right: "#2ec4b6" } }),
  F({ id: "chair_coral", name: "Coral Chair", desc: "Simple hotel chair.", category: "seating", price: 18, w: 1, d: 1, h: 1.4, sittable: true, use: "sit", shape: "chair", colors: { top: "#ff8a7a", left: "#d45444", right: "#ffb3a6", accent: "#f5c542" } }),
  F({ id: "armchair_teal", name: "Teal Armchair", desc: "Sink-in seat.", category: "seating", price: 36, w: 1, d: 1, h: 1.5, sittable: true, use: "sit", shape: "armchair", colors: { top: "#2ec4b6", left: "#1a8f86", right: "#5ee0d4" } }),
  F({ id: "sofa_sunset", name: "Sunset Sofa", desc: "Two-seat lounge.", category: "seating", price: 64, w: 2, d: 1, h: 1.4, sittable: true, use: "sit", shape: "sofa", colors: { top: "#ff6b5a", left: "#c44536", right: "#ff9e90" } }),
  F({ id: "loveseat_violet", name: "Violet Loveseat", desc: "Club-ready.", category: "seating", price: 72, w: 2, d: 1, h: 1.4, sittable: true, use: "sit", shape: "sofa", colors: { top: "#9945FF", left: "#6b21c4", right: "#c084fc" } }),
  F({ id: "bean_gold", name: "Gold Beanbag", desc: "Think-tank essential.", category: "seating", price: 28, w: 1, d: 1, h: 0.8, sittable: true, use: "sit", shape: "bean", colors: { top: "#f5c542", left: "#c49212", right: "#ffe08a" } }),
  F({ id: "bench_oak", name: "Oak Bench", desc: "Park-style sit.", category: "seating", price: 32, w: 2, d: 1, h: 0.9, sittable: true, use: "sit", shape: "bench", colors: { top: "#c4a574", left: "#8a6a3e", right: "#e2c9a0" } }),
  F({ id: "throne_obsidian", name: "Obsidian Throne", desc: "A rare high-back.", category: "seating", price: 2200, w: 1, d: 1, h: 2.4, sittable: true, rare: true, use: "sit", shape: "throne", colors: { top: "#1b1b2a", left: "#0b0b14", right: "#3b3b55", accent: "#f5c542" } }),
  F({ id: "lounger_pool", name: "Deck Lounger", desc: "Sun-facing.", category: "seating", price: 44, w: 1, d: 2, h: 0.6, sittable: true, use: "sit", shape: "lounger", colors: { top: "#ff8fab", left: "#2ec4b6", right: "#ffe08a" } }),

  F({ id: "bed_twin", name: "Twin Cloud Bed", desc: "Starter sleep.", category: "beds", price: 48, w: 1, d: 2, h: 0.8, sittable: true, use: "sit", shape: "bed", colors: { top: "#e8eefc", left: "#8aa4d4", right: "#c9d6f2", accent: "#ff6b5a" } }),
  F({ id: "bed_double", name: "Double Drift Bed", desc: "Room for sprawl.", category: "beds", price: 88, w: 2, d: 2, h: 0.9, sittable: true, use: "sit", shape: "bed", colors: { top: "#f4e4ff", left: "#9945FF", right: "#d4b3ff", accent: "#14F195" } }),
  F({ id: "bed_canopy", name: "Canopy Orbit Bed", desc: "Rare four-poster.", category: "beds", price: 640, w: 2, d: 2, h: 2.2, rare: true, sittable: true, use: "sit", shape: "canopy", colors: { top: "#fff6d6", left: "#c9a227", right: "#f5c542" } }),

  F({ id: "table_coffee", name: "Coffee Block", desc: "Low table.", category: "tables", price: 22, w: 1, d: 1, h: 0.6, shape: "table", colors: { top: "#d7b48a", left: "#8a6240", right: "#c49a6c" } }),
  F({ id: "table_desk", name: "Builder Desk", desc: "Laptop-ready.", category: "tables", price: 40, w: 2, d: 1, h: 1.1, shape: "desk", colors: { top: "#3d3d55", left: "#222233", right: "#5a5a77", accent: "#14F195" } }),
  F({ id: "table_dining", name: "Dining Slab", desc: "Feeds a crew.", category: "tables", price: 70, w: 2, d: 2, h: 1, shape: "table", colors: { top: "#c4a574", left: "#6d4c2f", right: "#e0c49a" } }),
  F({ id: "nightstand", name: "Night Cube", desc: "Lamp companion.", category: "tables", price: 16, w: 1, d: 1, h: 0.8, shape: "box", colors: { top: "#5b4a3a", left: "#3a2c22", right: "#7a6550" } }),
  F({ id: "bar_table", name: "High Bar", desc: "Club leaner.", category: "tables", price: 38, w: 1, d: 1, h: 1.4, shape: "table", colors: { top: "#222233", left: "#11111a", right: "#9945FF" } }),

  F({ id: "lamp_floor", name: "Floor Lamp", desc: "Warm puddle of light.", category: "lighting", price: 20, w: 1, d: 1, h: 2.2, shape: "lamp", colors: { top: "#ffe08a", left: "#555566", right: "#f5c542" } }),
  F({ id: "lamp_lava", name: "Lava Column", desc: "Slow blobs.", category: "lighting", price: 55, w: 1, d: 1, h: 1.8, shape: "lava", colors: { top: "#ff6b5a", left: "#14F195", right: "#9945FF" } }),
  F({ id: "lamp_sol", name: "Solana Glow", desc: "Mint-purple wash.", category: "lighting", price: 90, w: 1, d: 1, h: 2, shape: "solamp", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "chandelier", name: "Chunk Chandelier", desc: "Lobby energy.", category: "lighting", price: 160, w: 1, d: 1, h: 1.6, shape: "chandelier", colors: { top: "#f5c542", left: "#fff0b0", right: "#c9a227" } }),
  F({ id: "neon_strip", name: "Neon Bar", desc: "Wall wash.", category: "lighting", price: 34, w: 2, d: 1, h: 0.4, walkable: true, shape: "neon", colors: { top: "#14F195", left: "#9945FF", right: "#2ec4b6" } }),

  F({ id: "tv_block", name: "Block TV", desc: "Big screen cube.", category: "electronics", price: 80, w: 2, d: 1, h: 1.4, shape: "tv", colors: { top: "#1a1a28", left: "#0d0d14", right: "#333344", accent: "#2ec4b6" } }),
  F({ id: "computer", name: "Build Box PC", desc: "For Cook Room energy.", category: "electronics", price: 70, w: 1, d: 1, h: 1.2, shape: "pc", colors: { top: "#e8eefc", left: "#333344", right: "#14F195" } }),
  F({ id: "jukebox", name: "Juke Tower", desc: "Looks loud.", category: "electronics", price: 120, w: 1, d: 1, h: 2, shape: "juke", colors: { top: "#ff6b5a", left: "#24143d", right: "#f5c542" } }),
  F({ id: "disco_ball", name: "Disco Orb", desc: "Throws club light.", category: "electronics", price: 150, w: 1, d: 1, h: 1.6, use: "dance", shape: "disco", colors: { top: "#dfe7ff", left: "#9945FF", right: "#14F195" } }),
  F({ id: "radio_retro", name: "Retro Radio", desc: "Tiny tuner.", category: "electronics", price: 24, w: 1, d: 1, h: 0.7, shape: "radio", colors: { top: "#f5c542", left: "#8a6a00", right: "#ff6b5a" } }),

  F({ id: "plant_cactus", name: "Block Cactus", desc: "Needs no water.", category: "plants", price: 14, w: 1, d: 1, h: 1.3, shape: "cactus", colors: { top: "#2f9e44", left: "#c4a574", right: "#14F195" } }),
  F({ id: "plant_palm", name: "Potted Palm", desc: "Lobby classic.", category: "plants", price: 26, w: 1, d: 1, h: 2, shape: "palm", colors: { top: "#2f9e44", left: "#c44536", right: "#5ee0d4" } }),
  F({ id: "plant_flower", name: "Flower Box", desc: "Window color.", category: "plants", price: 18, w: 1, d: 1, h: 0.8, shape: "flower", colors: { top: "#ff6b5a", left: "#2f9e44", right: "#f5c542" } }),
  F({ id: "plant_hedge", name: "Hedge Tile", desc: "Soft divider.", category: "plants", price: 22, w: 1, d: 1, h: 1.2, shape: "hedge", colors: { top: "#2f9e44", left: "#1d6b2e", right: "#5ecf70" } }),

  F({ id: "rug_small", name: "Tile Rug", desc: "Walkable color.", category: "rugs", price: 10, w: 2, d: 2, h: 0.05, walkable: true, shape: "rug", colors: { top: "#2ec4b6", left: "#1a8f86", right: "#7eeae0" } }),
  F({ id: "rug_large", name: "Grand Rug", desc: "Fills a suite.", category: "rugs", price: 40, w: 3, d: 3, h: 0.05, walkable: true, shape: "rug", colors: { top: "#9945FF", left: "#6b21c4", right: "#c084fc" } }),
  F({ id: "rug_neon", name: "Runway Rug", desc: "Club stripe.", category: "rugs", price: 48, w: 1, d: 3, h: 0.05, walkable: true, shape: "rug", colors: { top: "#14F195", left: "#9945FF", right: "#ff6b5a" } }),

  F({ id: "fridge", name: "Mini Fridge", desc: "Late-night snacks.", category: "kitchen", price: 60, w: 1, d: 1, h: 1.8, shape: "fridge", colors: { top: "#dfe7ff", left: "#8aa4d4", right: "#ffffff", accent: "#2ec4b6" } }),
  F({ id: "minibar", name: "Minibar", desc: "Bottles of 'sparkle'.", category: "kitchen", price: 54, w: 2, d: 1, h: 1.3, shape: "bar", colors: { top: "#24143d", left: "#12091f", right: "#f5c542" } }),

  F({ id: "divider", name: "Screen Divider", desc: "Split a studio.", category: "structure", price: 30, w: 2, d: 1, h: 2, shape: "divider", colors: { top: "#e8d5b5", left: "#b08968", right: "#f5e6cc" } }),
  F({ id: "wardrobe", name: "Wardrobe", desc: "Looks official.", category: "structure", price: 70, w: 2, d: 1, h: 2.2, shape: "wardrobe", colors: { top: "#6d4c2f", left: "#3d2a18", right: "#c4a574" } }),

  F({ id: "statue_btc", name: "Orange Diamond", desc: "A stylized HODL relic.", category: "crypto", price: 240, w: 1, d: 1, h: 2, shape: "diamond", colors: { top: "#f7931a", left: "#b35e00", right: "#ffb347" } }),
  F({ id: "statue_sol", name: "Mint Prism", desc: "Hotel-powered sculpture.", category: "crypto", price: 240, w: 1, d: 1, h: 2, shape: "prism", colors: { top: "#14F195", left: "#9945FF", right: "#2ec4b6" } }),
  F({ id: "hologram_orb", name: "Hologram Orb", desc: "Rare floating core.", category: "crypto", price: 1800, w: 1, d: 1, h: 1.6, rare: true, shape: "orb", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "crystal_tree", name: "Crystal Tree", desc: "Rare grow.", category: "crypto", price: 2600, w: 2, d: 2, h: 2.6, rare: true, shape: "tree", colors: { top: "#a5f3fc", left: "#9945FF", right: "#14F195" } }),

  F({ id: "fountain", name: "Courtyard Fountain", desc: "Lobby splash.", category: "decor", price: 180, w: 2, d: 2, h: 1.4, shape: "fountain", colors: { top: "#7dd3fc", left: "#f5c542", right: "#2ec4b6" } }),
  F({ id: "clock_block", name: "Block Clock", desc: "Always mint o'clock.", category: "decor", price: 28, w: 1, d: 1, h: 1.2, shape: "clock", colors: { top: "#ffffff", left: "#333344", right: "#ff6b5a" } }),

  F({ id: "dice_machine", name: "Dice Machine", desc: "Click to roll 1–6. Fun only — no wagers.", category: "games", price: 120, w: 1, d: 1, h: 1.5, use: "dice", shape: "dice", colors: { top: "#ffffff", left: "#ff6b5a", right: "#24143d" } }),
  F({ id: "arcade_cab", name: "Cabinet", desc: "Host a tiny game.", category: "games", price: 140, w: 1, d: 1, h: 2, use: "arcade", shape: "arcade", colors: { top: "#9945FF", left: "#24143d", right: "#14F195" } }),
  F({ id: "chess_table", name: "Chess Block", desc: "Sit and stare.", category: "games", price: 46, w: 1, d: 1, h: 0.8, shape: "chess", colors: { top: "#111111", left: "#eeeeee", right: "#888888" } }),

  F({ id: "teleporter", name: "Pad Teleporter", desc: "Pair two pads (same owner) to hop rooms.", category: "utility", price: 200, w: 1, d: 1, h: 0.3, walkable: true, use: "teleport", shape: "pad", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),

  F({ id: "frame_basic", name: "Plain Frame", desc: "Free wall frame for a Solana NFT.", category: "frames", price: 0, w: 1, d: 1, h: 1.6, slot: "wall", use: "frame", shape: "frame", colors: { top: "#d7b48a", left: "#8a6240", right: "#c49a6c" } }),
  F({ id: "frame_teak", name: "Teak Frame", desc: "Warmer wood.", category: "frames", price: 80, w: 1, d: 1, h: 1.7, slot: "wall", use: "frame", shape: "frame", colors: { top: "#c4a574", left: "#6d4c2f", right: "#e0c49a" } }),
  F({ id: "frame_neon", name: "Neon Frame", desc: "Mint-purple edge.", category: "frames", price: 200, w: 1, d: 1, h: 1.8, slot: "wall", use: "frame", shape: "frame", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "frame_gold", name: "Gold Frame", desc: "Chunky gilt.", category: "frames", price: 500, w: 1, d: 1, h: 1.9, slot: "wall", use: "frame", shape: "frame", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),
  F({ id: "frame_obsidian", name: "Obsidian Frame", desc: "Top-tier display.", category: "frames", price: 1200, w: 1, d: 1, h: 2, rare: true, slot: "wall", use: "frame", shape: "frame", colors: { top: "#11111a", left: "#000000", right: "#9945FF" } }),

  F({ id: "ad_board", name: "Billboard", desc: "Hotel ad surface.", category: "utility", price: 0, w: 2, d: 1, h: 2, slot: "wall", use: "ad", shape: "board", colors: { top: "#1b1433", left: "#0d0a1a", right: "#9945FF" } }),
  F({ id: "umbrella", name: "Deck Umbrella", desc: "Pool shade.", category: "outdoor", price: 42, w: 1, d: 1, h: 2.2, shape: "umbrella", colors: { top: "#ff6b5a", left: "#ffffff", right: "#2ec4b6" } }),
  F({ id: "dj_booth", name: "DJ Booth", desc: "Club heart.", category: "electronics", price: 280, w: 2, d: 1, h: 1.3, shape: "dj", colors: { top: "#24143d", left: "#12091f", right: "#14F195" } }),
];

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
] as const;

export function furn(id: string) {
  return CATALOG.find((f) => f.id === id);
}

export function footprint(def: FurnDef, rot: 0 | 1 | 2 | 3) {
  const swap = rot === 1 || rot === 3;
  return { w: swap ? def.d : def.w, d: swap ? def.w : def.d };
}
