const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const fail = [];

const HAIR_BOY = ["spike", "buzz", "mohawk", "undercut", "crop", "side"];
const HAIR_GIRL = ["long", "bob", "pony", "bun", "curl", "bangs", "twin"];
const TOP_BOY = ["hoodie", "tee", "jacket", "sweater", "tank", "shirt"];
const TOP_GIRL = ["hoodie", "tee", "blouse", "cami", "wrap", "cardi"];
const BOT_BOY = ["pants", "shorts", "cargo", "joggers", "jeans"];
const BOT_GIRL = ["pants", "shorts", "skirt", "dress", "leggings", "pleat"];

function load(name) {
  const f = path.join(DIR, name + ".png");
  if (!fs.existsSync(f)) return null;
  return PNG.sync.read(fs.readFileSync(f));
}

function opaque(img) {
  let n = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] > 16) n++;
  return n;
}

function bandOpaque(img, y0n, y1n) {
  const h = img.height;
  const w = img.width;
  const y0 = Math.floor(h * y0n);
  const y1 = Math.floor(h * y1n);
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < w; x++) {
      if (img.data[(y * w + x) * 4 + 3] > 16) n++;
    }
  }
  return n;
}

for (const [g, hairs, tops, bots] of [
  ["m", HAIR_BOY, TOP_BOY, BOT_BOY],
  ["f", HAIR_GIRL, TOP_GIRL, BOT_GIRL],
]) {
  for (const view of ["se", "ne"]) {
    const base = load(`${g}-base-${view}`);
    if (!base) fail.push(`missing base ${g}-base-${view}`);
    else if (opaque(base) < 40000) fail.push(`thin base ${g}-base-${view} ${opaque(base)}`);

    for (const pose of [`${g}-${view}-idle`, `${g}-se-idle`, `${g}-se-walk0`, `${g}-se-sit`]) {
      if (pose.includes("ne-sit")) continue;
      if (!load(pose) && pose.endsWith(`${view}-idle`)) fail.push(`missing pose ${pose}`);
    }

    for (const hair of hairs) {
      const id = `${g}-hair-${hair}-${view}-layer`;
      const img = load(id);
      if (!img) fail.push(`missing ${id}`);
      else {
        if (opaque(img) < 400) fail.push(`thin ${id}`);
        const legs = bandOpaque(img, 0.52, 1);
        if (legs > 200) fail.push(`hair-on-legs ${id} ${legs}`);
      }
    }
    for (const top of tops) {
      const id = `${g}-top-${top}-${view}-layer`;
      const img = load(id);
      if (!img) fail.push(`missing ${id}`);
      else {
        if (opaque(img) < 800) fail.push(`thin ${id}`);
        const head = bandOpaque(img, 0, 0.24);
        if (head > 80) fail.push(`shirt-on-head ${id} ${head}`);
      }
    }
    for (const bot of bots) {
      const id = `${g}-bot-${bot}-${view}-layer`;
      const img = load(id);
      if (!img) fail.push(`missing ${id}`);
      else if (opaque(img) < 800) fail.push(`thin ${id}`);
    }
  }
}

console.log(fail.length ? "FAILED\n" + fail.join("\n") : "all layer functions ok");
if (fail.length) process.exit(1);
