const fs = require("fs");
const path = require("path");

const IMG = path.join(
  process.env.USERPROFILE || "C:\\Users\\camer",
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
const FURN = path.join(__dirname, "..", "public", "art", "furn");
const ART = path.join(__dirname, "..", "public", "art");

const map = {
  "44.jpg": ["landing-bg.jpg", ART],
  "38.jpg": ["stool_mint.jpg", FURN],
  "39.jpg": ["chair_coral.jpg", FURN],
  "40.jpg": ["bench_oak.jpg", FURN],
  "41.jpg": ["throne_obsidian.jpg", FURN],
  "42.jpg": ["bed_double.jpg", FURN],
  "43.jpg": ["bed_canopy.jpg", FURN],
  "37.jpg": ["table_desk.jpg", FURN],
  "45.jpg": ["nightstand.jpg", FURN],
  "46.jpg": ["lamp_sol.jpg", FURN],
  "47.jpg": ["bar_table.jpg", FURN],
  "48.jpg": ["table_dining.jpg", FURN],
  "49.jpg": ["chandelier.jpg", FURN],
  "50.jpg": ["tv_block.jpg", FURN],
  "51.jpg": ["lamp_lava.jpg", FURN],
  "52.jpg": ["computer.jpg", FURN],
  "53.jpg": ["radio_retro.jpg", FURN],
  "54.jpg": ["plant_cactus.jpg", FURN],
  "55.jpg": ["plant_hedge.jpg", FURN],
  "56.jpg": ["jukebox.jpg", FURN],
  "57.jpg": ["plant_flower.jpg", FURN],
  "58.jpg": ["minibar.jpg", FURN],
  "59.jpg": ["divider.jpg", FURN],
  "60.jpg": ["neon_strip.jpg", FURN],
  "61.jpg": ["statue_sol.jpg", FURN],
  "62.jpg": ["chess_table.jpg", FURN],
  "63.jpg": ["crystal_tree.jpg", FURN],
  "64.jpg": ["statue_btc.jpg", FURN],
  "65.jpg": ["arcade_cab.jpg", FURN],
  "66.jpg": ["hologram_orb.jpg", FURN],
  "67.jpg": ["wardrobe.jpg", FURN],
  "68.jpg": ["clock_block.jpg", FURN],
  "69.jpg": ["frame_teak.jpg", FURN],
  "70.jpg": ["frame_obsidian.jpg", FURN],
  "71.jpg": ["umbrella.jpg", FURN],
  "72.jpg": ["dj_booth.jpg", FURN],
  "73.jpg": ["frame_basic.jpg", FURN],
  "74.jpg": ["frame_neon.jpg", FURN],
};

if (!fs.existsSync(IMG)) {
  console.error("missing images dir", IMG);
  process.exit(1);
}

for (const [srcName, [destName, destDir]] of Object.entries(map)) {
  const src = path.join(IMG, srcName);
  if (!fs.existsSync(src)) {
    console.warn("skip missing", srcName);
    continue;
  }
  const dest = path.join(destDir, destName);
  fs.copyFileSync(src, dest);
  console.log("copied", srcName, "->", dest);
}
