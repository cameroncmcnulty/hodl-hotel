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
  use?: FurnUse;
  shape: string;
  colors: { top: string; left: string; right: string; accent?: string };
};

const F = (partial: FurnDef): FurnDef => ({
  rot4: true,
  rarity: partial.rarity ?? (partial.rare ? "rare" : "common"),
  ...partial,
  slot: partial.slot ?? "floor",
  rare: partial.rare || ["rare", "elite", "gold", "crypto"].includes(partial.rarity || ""),
});

export const CATALOG: FurnDef[] = [
  F({ id: "stool_mint", name: "Mint Stool", desc: "A chunky round perch.", category: "seating", price: 12, w: 1, d: 1, h: 1, sittable: true, use: "sit", shape: "stool", colors: { top: "#14F195", left: "#0d9b6a", right: "#2ec4b6" } }),
  F({ id: "chair_coral", name: "Coral Chair", desc: "Simple hotel chair.", category: "seating", price: 18, w: 1, d: 1, h: 1.4, sittable: true, use: "sit", shape: "chair", colors: { top: "#ff8a7a", left: "#d45444", right: "#ffb3a6", accent: "#f5c542" } }),
  F({ id: "armchair_teal", name: "Teal Armchair", desc: "Sink-in seat.", category: "seating", price: 36, w: 1, d: 1, h: 1.5, sittable: true, use: "sit", shape: "armchair", colors: { top: "#2ec4b6", left: "#1a8f86", right: "#5ee0d4" } }),
  F({ id: "chair_director", name: "Director Chair", desc: "Canvas and wood.", category: "seating", price: 42, w: 1, d: 1, h: 1.5, rarity: "uncommon", sittable: true, use: "sit", shape: "chair", colors: { top: "#f5e6cc", left: "#6d4c2f", right: "#c4a574" } }),
  F({ id: "chair_gamer", name: "Gamer Seat", desc: "Mint piping.", category: "seating", price: 96, w: 1, d: 1, h: 1.6, rarity: "uncommon", sittable: true, use: "sit", shape: "armchair", colors: { top: "#24143d", left: "#14F195", right: "#9945FF" } }),
  F({ id: "sofa_sunset", name: "Sunset Sofa", desc: "Two-seat lounge.", category: "seating", price: 64, w: 2, d: 1, h: 1.4, sittable: true, use: "sit", shape: "sofa", colors: { top: "#ff6b5a", left: "#c44536", right: "#ff9e90" } }),
  F({ id: "loveseat_violet", name: "Violet Loveseat", desc: "Club-ready.", category: "seating", price: 72, w: 2, d: 1, h: 1.4, sittable: true, use: "sit", shape: "sofa", colors: { top: "#9945FF", left: "#6b21c4", right: "#c084fc" } }),
  F({ id: "bean_gold", name: "Gold Beanbag", desc: "Think-tank essential.", category: "seating", price: 28, w: 1, d: 1, h: 0.8, sittable: true, use: "sit", shape: "bean", colors: { top: "#f5c542", left: "#c49212", right: "#ffe08a" } }),
  F({ id: "bench_oak", name: "Oak Bench", desc: "Park-style sit.", category: "seating", price: 32, w: 2, d: 1, h: 0.9, sittable: true, use: "sit", shape: "bench", colors: { top: "#c4a574", left: "#8a6a3e", right: "#e2c9a0" } }),
  F({ id: "ottoman_cream", name: "Cream Ottoman", desc: "Kick your feet up.", category: "seating", price: 22, w: 1, d: 1, h: 0.7, sittable: true, use: "sit", shape: "stool", colors: { top: "#f5e6cc", left: "#c4a574", right: "#fff6e8" } }),
  F({ id: "lounger_pool", name: "Deck Lounger", desc: "Sun-facing.", category: "seating", price: 44, w: 1, d: 2, h: 0.6, sittable: true, use: "sit", shape: "lounger", colors: { top: "#ff8fab", left: "#2ec4b6", right: "#ffe08a" } }),
  F({ id: "throne_obsidian", name: "Obsidian Throne", desc: "A rare high-back.", category: "seating", price: 2200, w: 1, d: 1, h: 2.4, rarity: "elite", sittable: true, use: "sit", shape: "throne", colors: { top: "#1b1b2a", left: "#0b0b14", right: "#3b3b55", accent: "#f5c542" } }),
  F({ id: "sofa_gold", name: "Gold Chesterfield", desc: "Tufted gilt lounge.", category: "seating", price: 3400, w: 2, d: 1, h: 1.5, rarity: "gold", sittable: true, use: "sit", shape: "sofa", colors: { top: "#f5c542", left: "#8a6a00", right: "#ffe08a" } }),
  F({ id: "stool_bar", name: "Bar Stool", desc: "High perch, mint ring.", category: "seating", price: 26, w: 1, d: 1, h: 1.5, rarity: "uncommon", sittable: true, use: "sit", shape: "stool", colors: { top: "#14F195", left: "#24143d", right: "#2ec4b6" } }),
  F({ id: "chair_wing", name: "Plum Wingback", desc: "High ears, velvet.", category: "seating", price: 210, w: 1, d: 1, h: 1.9, rarity: "rare", sittable: true, use: "sit", shape: "armchair", colors: { top: "#6b21c4", left: "#3b0764", right: "#c084fc" } }),
  F({ id: "sofa_corner", name: "Corner Sectional", desc: "L-shape lounge.", category: "seating", price: 160, w: 2, d: 2, h: 1.4, rarity: "uncommon", sittable: true, use: "sit", shape: "sofa", colors: { top: "#2ec4b6", left: "#1a8f86", right: "#f5e6cc" } }),
  F({ id: "recliner_navy", name: "Navy Recliner", desc: "Kicks back.", category: "seating", price: 92, w: 1, d: 1, h: 1.5, rarity: "uncommon", sittable: true, use: "sit", shape: "armchair", colors: { top: "#1e3a8a", left: "#0f172a", right: "#60a5fa" } }),
  F({ id: "chair_fold", name: "Fold Chair", desc: "Lobby extra.", category: "seating", price: 8, w: 1, d: 1, h: 1.3, sittable: true, use: "sit", shape: "chair", colors: { top: "#e8eefc", left: "#6b7280", right: "#d1d5db" } }),
  F({ id: "sofa_mint", name: "Mint Club Sofa", desc: "Hotel signature.", category: "seating", price: 84, w: 2, d: 1, h: 1.4, sittable: true, use: "sit", shape: "sofa", colors: { top: "#14F195", left: "#0d9b6a", right: "#5ee0d4" } }),

  F({ id: "bed_twin", name: "Twin Cloud Bed", desc: "Starter sleep.", category: "beds", price: 48, w: 1, d: 2, h: 0.8, sittable: true, use: "sit", shape: "bed", colors: { top: "#e8eefc", left: "#8aa4d4", right: "#c9d6f2", accent: "#ff6b5a" } }),
  F({ id: "bed_double", name: "Double Drift Bed", desc: "Room for sprawl.", category: "beds", price: 88, w: 2, d: 2, h: 0.9, sittable: true, use: "sit", shape: "bed", colors: { top: "#f4e4ff", left: "#9945FF", right: "#d4b3ff", accent: "#14F195" } }),
  F({ id: "bed_canopy", name: "Canopy Orbit Bed", desc: "Rare four-poster.", category: "beds", price: 640, w: 2, d: 2, h: 2.2, rarity: "rare", sittable: true, use: "sit", shape: "canopy", colors: { top: "#fff6d6", left: "#c9a227", right: "#f5c542" } }),
  F({ id: "bed_king_gold", name: "King Gilt Bed", desc: "Elite suite sleep.", category: "beds", price: 2800, w: 2, d: 2, h: 1.2, rarity: "gold", sittable: true, use: "sit", shape: "bed", colors: { top: "#fff6d6", left: "#c9a227", right: "#f5c542" } }),
  F({ id: "bed_day", name: "Daybed", desc: "Nap in the lobby.", category: "beds", price: 58, w: 2, d: 1, h: 0.85, sittable: true, use: "sit", shape: "bed", colors: { top: "#e8eefc", left: "#8aa4d4", right: "#ff8fab" } }),

  F({ id: "table_coffee", name: "Coffee Block", desc: "Low table.", category: "tables", price: 22, w: 1, d: 1, h: 0.6, shape: "table", colors: { top: "#d7b48a", left: "#8a6240", right: "#c49a6c" } }),
  F({ id: "table_desk", name: "Builder Desk", desc: "Laptop-ready.", category: "tables", price: 40, w: 2, d: 1, h: 1.1, shape: "desk", colors: { top: "#3d3d55", left: "#222233", right: "#5a5a77", accent: "#14F195" } }),
  F({ id: "table_dining", name: "Dining Slab", desc: "Feeds a crew.", category: "tables", price: 70, w: 2, d: 2, h: 1, shape: "table", colors: { top: "#c4a574", left: "#6d4c2f", right: "#e0c49a" } }),
  F({ id: "nightstand", name: "Night Cube", desc: "Lamp companion.", category: "tables", price: 16, w: 1, d: 1, h: 0.8, shape: "box", colors: { top: "#5b4a3a", left: "#3a2c22", right: "#7a6550" } }),
  F({ id: "bar_table", name: "High Bar", desc: "Club leaner.", category: "tables", price: 38, w: 1, d: 1, h: 1.4, shape: "table", colors: { top: "#222233", left: "#11111a", right: "#9945FF" } }),
  F({ id: "table_glass", name: "Glass Coffee", desc: "See-through slab.", category: "tables", price: 110, w: 1, d: 1, h: 0.55, rarity: "uncommon", shape: "table", colors: { top: "#a5f3fc", left: "#67e8f9", right: "#ecfeff" } }),
  F({ id: "podium_sol", name: "Mint Podium", desc: "Announce the drop.", category: "tables", price: 180, w: 1, d: 1, h: 1.3, rarity: "rare", shape: "table", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "table_round", name: "Cafe Round", desc: "Two-person top.", category: "tables", price: 34, w: 1, d: 1, h: 1, shape: "table", colors: { top: "#c4a574", left: "#6d4c2f", right: "#e0c49a" } }),
  F({ id: "console_gold", name: "Gilt Console", desc: "Hall flex.", category: "tables", price: 980, w: 2, d: 1, h: 1.1, rarity: "gold", shape: "desk", colors: { top: "#f5c542", left: "#8a6a00", right: "#fff0b0" } }),
  F({ id: "table_picnic", name: "Picnic Slab", desc: "Courtyard eat.", category: "tables", price: 44, w: 2, d: 1, h: 0.9, shape: "table", colors: { top: "#c4a574", left: "#6d4c2f", right: "#2f9e44" } }),

  F({ id: "lamp_floor", name: "Floor Lamp", desc: "Warm puddle of light.", category: "lighting", price: 20, w: 1, d: 1, h: 2.2, shape: "lamp", colors: { top: "#ffe08a", left: "#555566", right: "#f5c542" } }),
  F({ id: "lamp_lava", name: "Lava Column", desc: "Slow blobs.", category: "lighting", price: 55, w: 1, d: 1, h: 1.8, shape: "lava", colors: { top: "#ff6b5a", left: "#14F195", right: "#9945FF" } }),
  F({ id: "lamp_sol", name: "Solana Glow", desc: "Mint-purple wash.", category: "lighting", price: 90, w: 1, d: 1, h: 2, rarity: "uncommon", shape: "solamp", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "chandelier", name: "Chunk Chandelier", desc: "Lobby energy.", category: "lighting", price: 160, w: 1, d: 1, h: 1.6, rarity: "uncommon", shape: "chandelier", colors: { top: "#f5c542", left: "#fff0b0", right: "#c9a227" } }),
  F({ id: "neon_strip", name: "Neon Bar", desc: "Wall wash.", category: "lighting", price: 34, w: 2, d: 1, h: 0.4, walkable: true, shape: "neon", colors: { top: "#14F195", left: "#9945FF", right: "#2ec4b6" } }),
  F({ id: "lamp_gold", name: "Gilt Torchere", desc: "Elite glow.", category: "lighting", price: 880, w: 1, d: 1, h: 2.3, rarity: "gold", shape: "lamp", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),
  F({ id: "lamp_desk", name: "Desk Glow", desc: "Task light.", category: "lighting", price: 16, w: 1, d: 1, h: 0.9, shape: "lamp", colors: { top: "#ffe08a", left: "#333344", right: "#f5c542" } }),
  F({ id: "candle_gold", name: "Gilt Candelabra", desc: "Three flames.", category: "lighting", price: 720, w: 1, d: 1, h: 1.6, rarity: "gold", shape: "lamp", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),
  F({ id: "lantern_paper", name: "Paper Lantern", desc: "Soft lobby glow.", category: "lighting", price: 28, w: 1, d: 1, h: 1.5, shape: "lamp", colors: { top: "#fff6e8", left: "#ff8fab", right: "#f5c542" } }),
  F({ id: "lamp_neon_tower", name: "Neon Tower", desc: "Club column light.", category: "lighting", price: 340, w: 1, d: 1, h: 2.5, rarity: "rare", shape: "solamp", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),

  F({ id: "tv_block", name: "Block TV", desc: "Big screen cube.", category: "electronics", price: 80, w: 2, d: 1, h: 1.4, shape: "tv", colors: { top: "#1a1a28", left: "#0d0d14", right: "#333344", accent: "#2ec4b6" } }),
  F({ id: "computer", name: "Build Box PC", desc: "For Cook Room energy.", category: "electronics", price: 70, w: 1, d: 1, h: 1.2, shape: "pc", colors: { top: "#e8eefc", left: "#333344", right: "#14F195" } }),
  F({ id: "jukebox", name: "Juke Tower", desc: "Looks loud.", category: "electronics", price: 120, w: 1, d: 1, h: 2, rarity: "uncommon", shape: "juke", colors: { top: "#ff6b5a", left: "#24143d", right: "#f5c542" } }),
  F({ id: "disco_ball", name: "Disco Orb", desc: "Throws club light.", category: "electronics", price: 150, w: 1, d: 1, h: 1.6, use: "dance", shape: "disco", colors: { top: "#dfe7ff", left: "#9945FF", right: "#14F195" } }),
  F({ id: "radio_retro", name: "Retro Radio", desc: "Tiny tuner.", category: "electronics", price: 24, w: 1, d: 1, h: 0.7, shape: "radio", colors: { top: "#f5c542", left: "#8a6a00", right: "#ff6b5a" } }),
  F({ id: "dj_booth", name: "DJ Booth", desc: "Club heart.", category: "electronics", price: 280, w: 2, d: 1, h: 1.3, rarity: "rare", shape: "dj", colors: { top: "#24143d", left: "#12091f", right: "#14F195" } }),
  F({ id: "speaker_tower", name: "Tower Speakers", desc: "Looks expensive.", category: "electronics", price: 95, w: 1, d: 1, h: 1.8, rarity: "uncommon", shape: "juke", colors: { top: "#111111", left: "#333", right: "#14F195" } }),
  F({ id: "laptop_mint", name: "Mint Laptop", desc: "Open and glowing.", category: "electronics", price: 64, w: 1, d: 1, h: 0.5, shape: "pc", colors: { top: "#14F195", left: "#24143d", right: "#e8eefc" } }),
  F({ id: "projector_club", name: "Club Projector", desc: "Throws a beam.", category: "electronics", price: 220, w: 1, d: 1, h: 0.8, rarity: "rare", shape: "pc", colors: { top: "#111", left: "#333", right: "#14F195" } }),

  F({ id: "plant_cactus", name: "Block Cactus", desc: "Needs no water.", category: "plants", price: 14, w: 1, d: 1, h: 1.3, shape: "cactus", colors: { top: "#2f9e44", left: "#c4a574", right: "#14F195" } }),
  F({ id: "plant_palm", name: "Potted Palm", desc: "Lobby classic.", category: "plants", price: 26, w: 1, d: 1, h: 2, shape: "palm", colors: { top: "#2f9e44", left: "#c44536", right: "#5ee0d4" } }),
  F({ id: "plant_flower", name: "Flower Box", desc: "Window color.", category: "plants", price: 18, w: 1, d: 1, h: 0.8, shape: "flower", colors: { top: "#ff6b5a", left: "#2f9e44", right: "#f5c542" } }),
  F({ id: "plant_hedge", name: "Hedge Tile", desc: "Soft divider.", category: "plants", price: 22, w: 1, d: 1, h: 1.2, shape: "hedge", colors: { top: "#2f9e44", left: "#1d6b2e", right: "#5ecf70" } }),
  F({ id: "plant_monstera", name: "Monstera Pot", desc: "Big leaves.", category: "plants", price: 34, w: 1, d: 1, h: 1.6, shape: "palm", colors: { top: "#2f9e44", left: "#6d4c2f", right: "#5ecf70" } }),
  F({ id: "bonsai_gold", name: "Gold Bonsai", desc: "Tiny gilt tree.", category: "plants", price: 2100, w: 1, d: 1, h: 1.4, rarity: "gold", shape: "tree", colors: { top: "#f5c542", left: "#6d4c2f", right: "#ffe08a" } }),
  F({ id: "plant_orchid", name: "Orchid Pot", desc: "Lobby bloom.", category: "plants", price: 42, w: 1, d: 1, h: 1.2, rarity: "uncommon", shape: "flower", colors: { top: "#c084fc", left: "#2f9e44", right: "#f5e6cc" } }),
  F({ id: "plant_bamboo", name: "Bamboo Stand", desc: "Tall stalks.", category: "plants", price: 32, w: 1, d: 1, h: 2.1, shape: "hedge", colors: { top: "#2f9e44", left: "#6d4c2f", right: "#5ecf70" } }),

  F({ id: "rug_small", name: "Tile Rug", desc: "Walkable color.", category: "rugs", price: 10, w: 2, d: 2, h: 0.05, walkable: true, shape: "rug", colors: { top: "#2ec4b6", left: "#1a8f86", right: "#7eeae0" } }),
  F({ id: "rug_large", name: "Grand Rug", desc: "Fills a suite.", category: "rugs", price: 40, w: 3, d: 3, h: 0.05, walkable: true, shape: "rug", colors: { top: "#9945FF", left: "#6b21c4", right: "#c084fc" } }),
  F({ id: "rug_neon", name: "Runway Rug", desc: "Club stripe.", category: "rugs", price: 48, w: 1, d: 3, h: 0.05, walkable: true, shape: "rug", colors: { top: "#14F195", left: "#9945FF", right: "#ff6b5a" } }),
  F({ id: "rug_gold", name: "Gold Runner", desc: "Elite carpet.", category: "rugs", price: 420, w: 1, d: 3, h: 0.05, rarity: "gold", walkable: true, shape: "rug", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),

  F({ id: "fridge", name: "Mini Fridge", desc: "Late-night snacks.", category: "kitchen", price: 60, w: 1, d: 1, h: 1.8, shape: "fridge", colors: { top: "#dfe7ff", left: "#8aa4d4", right: "#ffffff", accent: "#2ec4b6" } }),
  F({ id: "minibar", name: "Minibar", desc: "Bottles of 'sparkle'.", category: "kitchen", price: 54, w: 2, d: 1, h: 1.3, shape: "bar", colors: { top: "#24143d", left: "#12091f", right: "#f5c542" } }),
  F({ id: "coffee_machine", name: "Espresso Block", desc: "Hotel drip.", category: "kitchen", price: 58, w: 1, d: 1, h: 1.1, rarity: "uncommon", shape: "pc", colors: { top: "#111", left: "#333", right: "#c4a574" } }),
  F({ id: "ice_bucket", name: "Ice Bucket", desc: "Club service.", category: "kitchen", price: 36, w: 1, d: 1, h: 0.8, shape: "box", colors: { top: "#dfe7ff", left: "#8aa4d4", right: "#ffffff" } }),
  F({ id: "stove_suite", name: "Suite Range", desc: "Looks chef-y.", category: "kitchen", price: 96, w: 2, d: 1, h: 1.2, shape: "bar", colors: { top: "#111", left: "#333", right: "#ff6b5a" } }),
  F({ id: "toaster_chrome", name: "Chrome Toaster", desc: "Two-slice.", category: "kitchen", price: 22, w: 1, d: 1, h: 0.55, shape: "box", colors: { top: "#d1d5db", left: "#6b7280", right: "#ff6b5a" } }),
  F({ id: "sink_block", name: "Block Sink", desc: "Suite wash.", category: "kitchen", price: 40, w: 1, d: 1, h: 1, shape: "box", colors: { top: "#e8eefc", left: "#8aa4d4", right: "#ffffff" } }),

  F({ id: "divider", name: "Screen Divider", desc: "Split a studio.", category: "structure", price: 30, w: 2, d: 1, h: 2, shape: "divider", colors: { top: "#e8d5b5", left: "#b08968", right: "#f5e6cc" } }),
  F({ id: "wardrobe", name: "Wardrobe", desc: "Looks official.", category: "structure", price: 70, w: 2, d: 1, h: 2.2, shape: "wardrobe", colors: { top: "#6d4c2f", left: "#3d2a18", right: "#c4a574" } }),
  F({ id: "bookshelf", name: "Block Books", desc: "Looks well-read.", category: "structure", price: 85, w: 2, d: 1, h: 2.1, rarity: "uncommon", shape: "wardrobe", colors: { top: "#6d4c2f", left: "#3d2a18", right: "#f5c542" } }),
  F({ id: "safe_vault", name: "Suite Safe", desc: "Elite lockbox.", category: "structure", price: 1600, w: 1, d: 1, h: 1.4, rarity: "elite", shape: "box", colors: { top: "#3d3d55", left: "#111", right: "#f5c542" } }),
  F({ id: "crate_storage", name: "Storage Crate", desc: "Stackable vibe.", category: "structure", price: 20, w: 1, d: 1, h: 0.9, shape: "box", colors: { top: "#c4a574", left: "#6d4c2f", right: "#e0c49a" } }),
  F({ id: "marble_column", name: "Marble Column", desc: "Lobby flex.", category: "structure", price: 260, w: 1, d: 1, h: 2.6, rarity: "rare", shape: "lamp", colors: { top: "#e8eefc", left: "#8aa4d4", right: "#ffffff" } }),
  F({ id: "fireplace_gold", name: "Gilt Hearth", desc: "Gold surround, warm.", category: "structure", price: 2400, w: 2, d: 1, h: 2.2, rarity: "gold", shape: "wardrobe", colors: { top: "#f5c542", left: "#c44536", right: "#fff0b0" } }),
  F({ id: "coat_rack", name: "Coat Rack", desc: "Hats welcome.", category: "structure", price: 18, w: 1, d: 1, h: 2.1, shape: "lamp", colors: { top: "#6d4c2f", left: "#3d2a18", right: "#c4a574" } }),
  F({ id: "locker_gym", name: "Gym Locker", desc: "Metal door.", category: "structure", price: 48, w: 1, d: 1, h: 2, shape: "wardrobe", colors: { top: "#6b7280", left: "#374151", right: "#14F195" } }),
  F({ id: "pillar_neon", name: "Neon Pillar", desc: "Club architecture.", category: "structure", price: 190, w: 1, d: 1, h: 2.5, rarity: "rare", shape: "lamp", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),

  F({ id: "statue_btc", name: "Orange Diamond", desc: "A stylized HODL relic.", category: "crypto", price: 240, w: 1, d: 1, h: 2, rarity: "crypto", shape: "diamond", colors: { top: "#f7931a", left: "#b35e00", right: "#ffb347" } }),
  F({ id: "statue_sol", name: "Mint Prism", desc: "Hotel-powered sculpture.", category: "crypto", price: 240, w: 1, d: 1, h: 2, rarity: "crypto", shape: "prism", colors: { top: "#14F195", left: "#9945FF", right: "#2ec4b6" } }),
  F({ id: "hologram_orb", name: "Hologram Orb", desc: "Rare floating core.", category: "crypto", price: 1800, w: 1, d: 1, h: 1.6, rarity: "crypto", shape: "orb", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "crystal_tree", name: "Crystal Tree", desc: "Rare grow.", category: "crypto", price: 2600, w: 2, d: 2, h: 2.6, rarity: "crypto", shape: "tree", colors: { top: "#a5f3fc", left: "#9945FF", right: "#14F195" } }),
  F({ id: "gold_stack", name: "Gold Stack", desc: "Three bars. Say less.", category: "crypto", price: 2800, w: 1, d: 1, h: 0.8, rarity: "gold", shape: "box", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),
  F({ id: "ledger_altar", name: "Ledger Altar", desc: "Elite shrine.", category: "crypto", price: 4500, w: 1, d: 1, h: 1.5, rarity: "crypto", shape: "table", colors: { top: "#111", left: "#14F195", right: "#9945FF" } }),
  F({ id: "whale_plush", name: "Whale Plush", desc: "Sittable flex.", category: "crypto", price: 1200, w: 2, d: 1, h: 1.2, rarity: "elite", sittable: true, use: "sit", shape: "sofa", colors: { top: "#3b82f6", left: "#1e3a8a", right: "#93c5fd" } }),
  F({ id: "sol_obelisk", name: "Sol Obelisk", desc: "Mint monolith.", category: "crypto", price: 4800, w: 1, d: 1, h: 2.8, rarity: "crypto", shape: "prism", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "bitcoin_furnace", name: "Hash Furnace", desc: "Looks hot. Is art.", category: "crypto", price: 5200, w: 2, d: 1, h: 1.8, rarity: "crypto", shape: "tv", colors: { top: "#f7931a", left: "#111", right: "#ffb347" } }),
  F({ id: "nft_plinth", name: "NFT Plinth", desc: "Empty on purpose.", category: "crypto", price: 960, w: 1, d: 1, h: 1.2, rarity: "crypto", shape: "table", colors: { top: "#111", left: "#14F195", right: "#9945FF" } }),
  F({ id: "moon_bag", name: "Moon Bag", desc: "Inflated. On purpose.", category: "crypto", price: 1700, w: 1, d: 1, h: 1.4, rarity: "crypto", sittable: true, use: "sit", shape: "bean", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "satoshi_bust", name: "Founder Bust", desc: "Nobody knows.", category: "crypto", price: 3900, w: 1, d: 1, h: 1.6, rarity: "elite", shape: "orb", colors: { top: "#c4a574", left: "#6d4c2f", right: "#f5c542" } }),
  F({ id: "mining_rig", name: "Mining Rig", desc: "Fans for days.", category: "crypto", price: 780, w: 2, d: 1, h: 1.5, rarity: "rare", shape: "pc", colors: { top: "#111", left: "#14F195", right: "#f7931a" } }),
  F({ id: "laser_eyes", name: "Laser Pedestal", desc: "Eyes on the prize.", category: "crypto", price: 3100, w: 1, d: 1, h: 1.7, rarity: "crypto", shape: "orb", colors: { top: "#f7931a", left: "#111", right: "#14F195" } }),
  F({ id: "shillboard", name: "Shillboard", desc: "Wall LED ticker. Display a coin — the $ stays put, you type the letters.", category: "crypto", price: 180, w: 2, d: 1, h: 1.6, rarity: "crypto", slot: "wall", use: "ticker", shape: "board", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),

  F({ id: "fountain", name: "Courtyard Fountain", desc: "Lobby splash.", category: "decor", price: 180, w: 2, d: 2, h: 1.4, rarity: "uncommon", shape: "fountain", colors: { top: "#7dd3fc", left: "#f5c542", right: "#2ec4b6" } }),
  F({ id: "clock_block", name: "Block Clock", desc: "Always mint o'clock.", category: "decor", price: 28, w: 1, d: 1, h: 1.2, shape: "clock", colors: { top: "#ffffff", left: "#333344", right: "#ff6b5a" } }),
  F({ id: "trophy_cup", name: "Hotel Cup", desc: "Elite brag.", category: "decor", price: 750, w: 1, d: 1, h: 1.3, rarity: "elite", shape: "orb", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),
  F({ id: "vase_rare", name: "Mint Vase", desc: "Don't knock it.", category: "decor", price: 160, w: 1, d: 1, h: 1.1, rarity: "rare", shape: "orb", colors: { top: "#14F195", left: "#0d9b6a", right: "#9945FF" } }),
  F({ id: "velvet_rope", name: "Velvet Rope", desc: "VIP line.", category: "decor", price: 40, w: 2, d: 1, h: 1.1, shape: "divider", colors: { top: "#7c3aed", left: "#f5c542", right: "#24143d" } }),
  F({ id: "mirror_suite", name: "Suite Mirror", desc: "Wall glass.", category: "decor", price: 120, w: 1, d: 1, h: 1.8, slot: "wall", shape: "frame", colors: { top: "#dfe7ff", left: "#8aa4d4", right: "#ffffff" } }),
  F({ id: "globe_desk", name: "Desk Globe", desc: "Spin the world.", category: "decor", price: 48, w: 1, d: 1, h: 1.1, shape: "orb", colors: { top: "#2ec4b6", left: "#1e3a8a", right: "#f5c542" } }),
  F({ id: "statue_cat", name: "Lobby Cat", desc: "Does not move.", category: "decor", price: 88, w: 1, d: 1, h: 1.1, rarity: "uncommon", shape: "orb", colors: { top: "#f5e6cc", left: "#6d4c2f", right: "#ff8fab" } }),

  F({ id: "dice_machine", name: "Dice Machine", desc: "Click to roll 1–6. Fun only — no wagers.", category: "games", price: 120, w: 1, d: 1, h: 1.5, rarity: "uncommon", use: "dice", shape: "dice", colors: { top: "#ffffff", left: "#ff6b5a", right: "#24143d" } }),
  F({ id: "arcade_cab", name: "Cabinet", desc: "Host a tiny game.", category: "games", price: 140, w: 1, d: 1, h: 2, rarity: "uncommon", use: "arcade", shape: "arcade", colors: { top: "#9945FF", left: "#24143d", right: "#14F195" } }),
  F({ id: "chess_table", name: "Chess Block", desc: "Sit and stare.", category: "games", price: 46, w: 1, d: 1, h: 0.8, shape: "chess", colors: { top: "#111111", left: "#eeeeee", right: "#888888" } }),
  F({ id: "poker_table", name: "Felt Table", desc: "Cards optional.", category: "games", price: 180, w: 2, d: 2, h: 0.9, rarity: "rare", shape: "table", colors: { top: "#14532d", left: "#6d4c2f", right: "#f5c542" } }),
  F({ id: "pool_table", name: "Pool Table", desc: "Cues not included.", category: "games", price: 440, w: 2, d: 2, h: 0.9, rarity: "rare", shape: "table", colors: { top: "#14532d", left: "#6d4c2f", right: "#f5c542" } }),
  F({ id: "dart_board", name: "Dart Board", desc: "Wall game.", category: "games", price: 38, w: 1, d: 1, h: 1.2, slot: "wall", shape: "frame", colors: { top: "#ff6b5a", left: "#111", right: "#f5c542" } }),
  F({ id: "foosball", name: "Foos Table", desc: "Tiny players.", category: "games", price: 160, w: 2, d: 1, h: 1, rarity: "uncommon", shape: "table", colors: { top: "#c44536", left: "#6d4c2f", right: "#14F195" } }),

  F({ id: "teleporter", name: "Pad Teleporter", desc: "Pair two pads (same owner) to hop rooms.", category: "utility", price: 200, w: 1, d: 1, h: 0.3, walkable: true, use: "teleport", shape: "pad", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "ad_board", name: "Billboard", desc: "Hotel ad surface.", category: "utility", price: 0, w: 2, d: 1, h: 2, slot: "wall", use: "ad", shape: "board", colors: { top: "#1b1433", left: "#0d0a1a", right: "#9945FF" } }),

  F({ id: "frame_basic", name: "Plain Frame", desc: "Free wall frame for a Solana NFT.", category: "frames", price: 0, w: 1, d: 1, h: 1.6, slot: "wall", use: "frame", shape: "frame", colors: { top: "#d7b48a", left: "#8a6240", right: "#c49a6c" } }),
  F({ id: "frame_teak", name: "Teak Frame", desc: "Warmer wood.", category: "frames", price: 80, w: 1, d: 1, h: 1.7, slot: "wall", use: "frame", shape: "frame", colors: { top: "#c4a574", left: "#6d4c2f", right: "#e0c49a" } }),
  F({ id: "frame_neon", name: "Neon Frame", desc: "Mint-purple edge.", category: "frames", price: 200, w: 1, d: 1, h: 1.8, rarity: "uncommon", slot: "wall", use: "frame", shape: "frame", colors: { top: "#14F195", left: "#24143d", right: "#9945FF" } }),
  F({ id: "frame_gold", name: "Gold Frame", desc: "Chunky gilt.", category: "frames", price: 500, w: 1, d: 1, h: 1.9, rarity: "gold", slot: "wall", use: "frame", shape: "frame", colors: { top: "#f5c542", left: "#c9a227", right: "#fff0b0" } }),
  F({ id: "frame_obsidian", name: "Obsidian Frame", desc: "Top-tier display.", category: "frames", price: 1200, w: 1, d: 1, h: 2, rarity: "elite", slot: "wall", use: "frame", shape: "frame", colors: { top: "#11111a", left: "#000000", right: "#9945FF" } }),

  F({ id: "umbrella", name: "Deck Umbrella", desc: "Pool shade.", category: "outdoor", price: 42, w: 1, d: 1, h: 2.2, shape: "umbrella", colors: { top: "#ff6b5a", left: "#ffffff", right: "#2ec4b6" } }),
  F({ id: "grill_deck", name: "Deck Grill", desc: "Looks smoky.", category: "outdoor", price: 66, w: 1, d: 1, h: 1.2, rarity: "uncommon", shape: "box", colors: { top: "#111", left: "#333", right: "#ff6b5a" } }),
  F({ id: "hammock", name: "Palm Hammock", desc: "Two-post lounge.", category: "outdoor", price: 52, w: 2, d: 1, h: 1.1, sittable: true, use: "sit", shape: "bench", colors: { top: "#f5e6cc", left: "#6d4c2f", right: "#2f9e44" } }),
  F({ id: "firepit", name: "Fire Pit", desc: "Courtyard glow.", category: "outdoor", price: 74, w: 1, d: 1, h: 0.7, rarity: "uncommon", shape: "fountain", colors: { top: "#ff6b5a", left: "#6d4c2f", right: "#f5c542" } }),
  F({ id: "pool_float", name: "Pool Float", desc: "Mint ring.", category: "outdoor", price: 26, w: 1, d: 1, h: 0.25, sittable: true, use: "sit", walkable: true, shape: "pad", colors: { top: "#14F195", left: "#2ec4b6", right: "#ffe08a" } }),
  F({ id: "cabana_bed", name: "Cabana Daybed", desc: "Shaded sprawl.", category: "outdoor", price: 190, w: 2, d: 2, h: 1.6, rarity: "rare", sittable: true, use: "sit", shape: "canopy", colors: { top: "#ff8fab", left: "#2ec4b6", right: "#fff6e8" } }),
];

export const RARITY_TONE: Record<Rarity, string> = {
  common: "bg-white/15 text-white/70",
  uncommon: "bg-mint/20 text-mint",
  rare: "bg-sol/25 text-sol",
  elite: "bg-white/20 text-white",
  gold: "bg-gold/25 text-gold",
  crypto: "bg-orange-500/20 text-orange-300",
};

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
