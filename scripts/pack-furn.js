/**
 * Magenta-key HQ furniture JPEGs into trimmed transparent PNGs.
 */
const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const SRC = path.join(
  process.env.USERPROFILE || "C:\\Users\\camer",
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
const OUT = path.join(__dirname, "..", "public", "art", "furn");

const MAP = {
  "155.jpg": "throne_obsidian",
  "156.jpg": "armchair_teal",
  "157.jpg": "bed_twin",
  "158.jpg": "table_coffee",
  "159.jpg": "sofa_sunset",
  "160.jpg": "chair_coral",
  "161.jpg": "lamp_floor",
  "162.jpg": "gold_stack",
  "163.jpg": "plant_palm",
  "164.jpg": "table_desk",
  "165.jpg": "bed_double",
  "166.jpg": "stool_mint",
  "167.jpg": "tv_block",
  "168.jpg": "chair_gamer",
  "169.jpg": "loveseat_violet",
  "170.jpg": "ottoman_cream",
  "171.jpg": "chair_director",
  "172.jpg": "bench_oak",
  "173.jpg": "bean_gold",
  "174.jpg": "lounger_pool",
  "175.jpg": "recliner_navy",
  "176.jpg": "sofa_gold",
  "177.jpg": "stool_bar",
  "178.jpg": "chair_wing",
  "179.jpg": "sofa_corner",
  "180.jpg": "chair_fold",
  "181.jpg": "table_dining",
  "182.jpg": "bed_day",
  "183.jpg": "bed_king_gold",
  "184.jpg": "bed_canopy",
  "185.jpg": "sofa_mint",
  "186.jpg": "table_round",
  "187.jpg": "console_gold",
  "188.jpg": "bar_table",
  "189.jpg": "podium_sol",
  "190.jpg": "table_glass",
  "191.jpg": "nightstand",
  "192.jpg": "lamp_lava",
  "193.jpg": "chandelier",
  "194.jpg": "neon_strip",
  "195.jpg": "table_picnic",
  "196.jpg": "lamp_sol",
  "197.jpg": "lamp_gold",
  "198.jpg": "lamp_neon_tower",
  "199.jpg": "computer",
  "200.jpg": "candle_gold",
  "201.jpg": "lamp_desk",
  "202.jpg": "lantern_paper",
  "203.jpg": "jukebox",
  "204.jpg": "disco_ball",
  "205.jpg": "speaker_tower",
  "206.jpg": "radio_retro",
  "207.jpg": "dj_booth",
  "208.jpg": "projector_club",
  "209.jpg": "laptop_mint",
  "210.jpg": "plant_monstera",
  "211.jpg": "plant_flower",
  "212.jpg": "bonsai_gold",
  "213.jpg": "plant_orchid",
  "214.jpg": "plant_cactus",
  "215.jpg": "plant_hedge",
  "216.jpg": "rug_gold",
  "217.jpg": "fridge",
  "218.jpg": "rug_small",
  "219.jpg": "rug_neon",
  "220.jpg": "rug_large",
  "221.jpg": "plant_bamboo",
  "222.jpg": "sink_block",
  "223.jpg": "toaster_chrome",
  "224.jpg": "coffee_machine",
  "225.jpg": "minibar",
  "226.jpg": "ice_bucket",
  "227.jpg": "stove_suite",
  "228.jpg": "marble_column",
  "229.jpg": "divider",
  "230.jpg": "safe_vault",
  "231.jpg": "bookshelf",
  "232.jpg": "wardrobe",
  "233.jpg": "crate_storage",
  "234.jpg": "statue_sol",
  "235.jpg": "locker_gym",
  "236.jpg": "fireplace_gold",
  "237.jpg": "statue_btc",
  "238.jpg": "coat_rack",
  "239.jpg": "pillar_neon",
  "240.jpg": "ledger_altar",
  "241.jpg": "crystal_tree",
  "242.jpg": "bitcoin_furnace",
  "243.jpg": "hologram_orb",
  "244.jpg": "sol_obelisk",
  "245.jpg": "whale_plush",
  "246.jpg": "moon_bag",
  "247.jpg": "laser_eyes",
  "248.jpg": "nft_plinth",
  "249.jpg": "mining_rig",
  "250.jpg": "fountain",
  "251.jpg": "satoshi_bust",
  "252.jpg": "mirror_suite",
  "253.jpg": "vase_rare",
  "254.jpg": "globe_desk",
  "255.jpg": "velvet_rope",
  "256.jpg": "clock_block",
  "257.jpg": "trophy_cup",
  "258.jpg": "pool_table",
  "259.jpg": "chess_table",
  "260.jpg": "dice_machine",
  "261.jpg": "poker_table",
  "262.jpg": "arcade_cab",
  "263.jpg": "statue_cat",
  "264.jpg": "frame_teak",
  "265.jpg": "foosball",
  "266.jpg": "frame_basic",
  "267.jpg": "dart_board",
  "268.jpg": "teleporter",
  "269.jpg": "frame_neon",
  "270.jpg": "grill_deck",
  "271.jpg": "firepit",
  "272.jpg": "umbrella",
  "273.jpg": "frame_obsidian",
  "274.jpg": "hammock",
  "275.jpg": "frame_gold",
  "276.jpg": "pool_float",
  "277.jpg": "cabana_bed",
};

function isMagenta(r, g, b) {
  const dist = Math.hypot(r - 255, g - 0, b - 255);
  if (dist < 155) return true;
  if (r > 155 && b > 150 && g < 145 && Math.abs(r - b) < 95) return true;
  if (r > 190 && b > 140 && g < 175 && r + b > g * 2.15) return true;
  return false;
}

function convertJpeg(buf) {
  const decoded = jpeg.decode(buf, { maxMemoryUsageInMB: 256, useTArray: true });
  const w = decoded.width;
  const h = decoded.height;
  const src = Buffer.from(decoded.data);
  const out = Buffer.from(src);

  const keyed = Buffer.alloc(w * h);
  const stack = [];
  const tryKey = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (keyed[i]) return;
    const o = i * 4;
    if (!isMagenta(out[o], out[o + 1], out[o + 2])) return;
    keyed[i] = 1;
    out[o + 3] = 0;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) {
    tryKey(x, 0);
    tryKey(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryKey(0, y);
    tryKey(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i / w) | 0;
    tryKey(x - 1, y);
    tryKey(x + 1, y);
    tryKey(x, y - 1);
    tryKey(x, y + 1);
  }
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (keyed[i]) continue;
      let n = 0;
      if (keyed[i - 1]) n++;
      if (keyed[i + 1]) n++;
      if (keyed[i - w]) n++;
      if (keyed[i + w]) n++;
      if (n >= 2) {
        const o = i * 4;
        if (isMagenta(out[o], out[o + 1], out[o + 2]) || (out[o] > 160 && out[o + 2] > 140 && out[o + 1] < 190)) {
          out[o + 3] = 0;
        }
      }
    }
  }

  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (out[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return { width: w, height: h, data: out };
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const trimmed = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    const srcStart = ((minY + y) * w + minX) * 4;
    out.copy(trimmed, y * tw * 4, srcStart, srcStart + tw * 4);
  }
  return { width: tw, height: th, data: trimmed };
}

function nnScale(img, maxSide) {
  const m = Math.max(img.width, img.height);
  if (m <= maxSide) return img;
  const w = Math.max(1, Math.round((img.width * maxSide) / m));
  const h = Math.max(1, Math.round((img.height * maxSide) / m));
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(img.height - 1, Math.floor((y * img.height) / h));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor((x * img.width) / w));
      img.data.copy(data, (y * w + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
    }
  }
  return { width: w, height: h, data };
}

function writePng(file, img) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(file, PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let n = 0;
for (const [file, id] of Object.entries(MAP)) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) {
    console.log("missing", file, id);
    continue;
  }
  const img = nnScale(convertJpeg(fs.readFileSync(src)), 360);
  const dest = path.join(OUT, `${id}.png`);
  writePng(dest, img);
  n++;
  console.log("packed", file, "->", id, img.width + "x" + img.height);
}
console.log("done", n, "/", Object.keys(MAP).length);
