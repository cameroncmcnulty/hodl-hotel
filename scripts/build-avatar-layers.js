/**
 * Build a bald base body plus one hair / shirt / pants layer per option.
 * Then render test stacks to scripts/avatar-tests for visual QA.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const TEST = path.join(__dirname, "avatar-tests");
fs.mkdirSync(TEST, { recursive: true });

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

function save(name, img, destDir = DIR) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(path.join(destDir, name + ".png"), PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}

function blank(w, h) {
  return { width: w, height: h, data: Buffer.alloc(w * h * 4) };
}

function clone(img) {
  return { width: img.width, height: img.height, data: Buffer.from(img.data) };
}

function px(img, x, y) {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
}

function setPx(img, x, y, r, g, b, a) {
  const i = (y * img.width + x) * 4;
  img.data[i] = r;
  img.data[i + 1] = g;
  img.data[i + 2] = b;
  img.data[i + 3] = a;
}

function lum(r, g, b) {
  return (r * 0.32 + g * 0.5 + b * 0.18) / 255;
}

function isHair(r, g, b, a) {
  if (a < 16) return false;
  if (r > 155) return false;
  if (g < 14) return false;
  if (g <= r + 5) return false;
  if (b <= r) return false;
  if (b < g * 0.5) return false;
  return true;
}

function isHairInk(r, g, b, a, yn, xn) {
  if (isHair(r, g, b, a)) return true;
  if (a < 16 || yn > 0.28) return false;
  if (isSkin(r, g, b, a)) return false;
  if (yn > 0.2 && yn < 0.28 && xn > 0.36 && xn < 0.64) return false;
  return lum(r, g, b) < 0.22;
}

function isSkin(r, g, b, a) {
  if (a < 16) return false;
  if (r < 48 || g < 22) return false;
  if (r > 252 && g > 252 && b > 252) return false;
  return r > g - 8 && g >= b - 18 && r - b > 8 && g < 235 && b < 220 && r < 256;
}

function isShoe(r, g, b, a, yn) {
  if (a < 16 || yn < 0.84) return false;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx > 165 && mx - mn < 55;
}

function sampleSkin(img) {
  const w = img.width;
  const h = img.height;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const y0 = Math.floor(h * 0.2);
  const y1 = Math.floor(h * 0.34);
  const x0 = Math.floor(w * 0.38);
  const x1 = Math.floor(w * 0.62);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = px(img, x, y);
      if (isSkin(p[0], p[1], p[2], p[3])) {
        r += p[0];
        g += p[1];
        b += p[2];
        n++;
      }
    }
  }
  if (!n) return [240, 196, 160];
  return [(r / n) | 0, (g / n) | 0, (b / n) | 0];
}

function extractHair(src) {
  const out = blank(src.width, src.height);
  const h = src.height;
  const w = src.width;
  const mark = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = px(src, x, y);
      if (isHair(r, g, b, a) || isHairInk(r, g, b, a, yn, x / w)) mark[y * w + x] = 1;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mark[y * w + x]) continue;
      const [r, g, b, a] = px(src, x, y);
      if (a > 16) setPx(out, x, y, r, g, b, a);
    }
  }
  return out;
}

function extractTop(src) {
  const out = blank(src.width, src.height);
  const h = src.height;
  const w = src.width;
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    if (yn < 0.14 || yn > 0.64) continue;
    for (let x = 0; x < w; x++) {
      const xn = x / w;
      const [r, g, b, a] = px(src, x, y);
      if (a < 16) continue;
      if (isHair(r, g, b, a) || isHairInk(r, g, b, a, yn, xn)) continue;
      if (isShoe(r, g, b, a, yn)) continue;
      if (yn > 0.58 && Math.max(r, g, b) < 110 && !isSkin(r, g, b, a)) continue;
      if (isSkin(r, g, b, a) && yn < 0.34 && xn > 0.32 && xn < 0.68) continue;
      setPx(out, x, y, r, g, b, a);
    }
  }
  return out;
}

function extractBot(src) {
  const out = blank(src.width, src.height);
  const h = src.height;
  const w = src.width;
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    if (yn < 0.5 || yn > 0.88) continue;
    for (let x = 0; x < w; x++) {
      const xn = x / w;
      const [r, g, b, a] = px(src, x, y);
      if (a < 16) continue;
      if (isHair(r, g, b, a) || isHairInk(r, g, b, a, yn, xn)) continue;
      if (isShoe(r, g, b, a, yn)) continue;
      if (yn < 0.56 && xn > 0.28 && xn < 0.72 && Math.max(r, g, b) < 80 && !isSkin(r, g, b, a)) continue;
      setPx(out, x, y, r, g, b, a);
    }
  }
  return out;
}

function makeBase(idle, hairMask) {
  const out = clone(idle);
  const skin = sampleSkin(idle);
  const h = idle.height;
  const w = idle.width;
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = px(out, x, y);
      if (a < 8) continue;
      const xn = x / w;
      if (yn < 0.4 && !isSkin(r, g, b, a)) {
        if (yn > 0.18 && yn < 0.34 && xn > 0.38 && xn < 0.62) setPx(out, x, y, skin[0], skin[1], skin[2], 255);
        else setPx(out, x, y, 0, 0, 0, 0);
        continue;
      }
      if (isShoe(r, g, b, a, yn) || isSkin(r, g, b, a)) continue;
      if (yn > 0.26 && yn < 0.56 && xn > 0.4 && xn < 0.6) {
        setPx(out, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (yn >= 0.56 && yn < 0.84 && xn > 0.43 && xn < 0.57) {
        setPx(out, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (yn > 0.16 && yn < 0.86) setPx(out, x, y, 0, 0, 0, 0);
    }
  }
  return out;
}

function stack(base, layers) {
  const out = clone(base);
  for (const layer of layers) {
    if (!layer) continue;
    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        if (x >= layer.width || y >= layer.height) continue;
        const [r, g, b, a] = px(layer, x, y);
        if (a > 16) setPx(out, x, y, r, g, b, a);
      }
    }
  }
  return out;
}

function opaqueCount(img) {
  let n = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] > 16) n++;
  return n;
}

const views = ["se", "ne"];
const genders = [
  { g: "m", hairs: HAIR_BOY, tops: TOP_BOY, bots: BOT_BOY, defHair: "spike" },
  { g: "f", hairs: HAIR_GIRL, tops: TOP_GIRL, bots: BOT_GIRL, defHair: "long" },
];

for (const { g, hairs, tops, bots, defHair } of genders) {
  for (const view of views) {
    const idle = load(`${g}-${view}-idle`) || (view === "ne" ? load(`${g}-se-idle`) : null);
    if (!idle) continue;
    const idleLayer = load(`${g}-${view}-idle-layer`) || load(`${g}-se-idle-layer`);
    const base = makeBase(idle, idleLayer);
    save(`${g}-base-${view}`, base);
    console.log("base", `${g}-base-${view}`, opaqueCount(base));

    const defHairSrc = load(`${g}-hair-${defHair}-${view}-layer`) || idleLayer || idle;
    const defHairLayer = extractHair(defHairSrc);
    save(`${g}-hair-${defHair}-${view}-layer`, defHairLayer);
    console.log("hair", `${g}-hair-${defHair}-${view}-layer`, opaqueCount(defHairLayer));

    for (const name of hairs) {
      if (name === defHair) continue;
      const src = load(`${g}-hair-${name}-${view}-layer`) || load(`${g}-hair-${name}-se-layer`) || load(`${g}-hair-${name}-${view}`) || load(`${g}-hair-${name}-se`);
      if (!src) {
        console.log("missing hair", g, name, view);
        continue;
      }
      const layer = extractHair(src);
      save(`${g}-hair-${name}-${view}-layer`, layer);
      console.log("hair", `${g}-hair-${name}-${view}-layer`, opaqueCount(layer));
    }

    for (const name of tops) {
      const src =
        name === "hoodie"
          ? idle
          : load(`${g}-top-${name}-${view}`) || load(`${g}-top-${name}-se`);
      if (!src) {
        console.log("missing top", g, name, view);
        continue;
      }
      const layer = extractTop(src);
      save(`${g}-top-${name}-${view}-layer`, layer);
      console.log("top", `${g}-top-${name}-${view}-layer`, opaqueCount(layer));
    }

    for (const name of bots) {
      const src =
        name === "pants"
          ? idle
          : load(`${g}-bot-${name}-${view}`) || load(`${g}-bot-${name}-se`);
      if (!src) {
        console.log("missing bot", g, name, view);
        continue;
      }
      const layer = extractBot(src);
      save(`${g}-bot-${name}-${view}-layer`, layer);
      console.log("bot", `${g}-bot-${name}-${view}-layer`, opaqueCount(layer));
    }
  }
}

const tests = [
  ["boy-default", "m", "se", "spike", "hoodie", "pants"],
  ["boy-buzz-tee-shorts", "m", "se", "buzz", "tee", "shorts"],
  ["boy-mohawk-tank-cargo", "m", "se", "mohawk", "tank", "cargo"],
  ["girl-default", "f", "se", "long", "hoodie", "pants"],
  ["girl-bob-blouse-skirt", "f", "se", "bob", "blouse", "skirt"],
  ["girl-pony-cami-shorts", "f", "se", "pony", "cami", "shorts"],
  ["boy-buzz-jacket-pants", "m", "se", "buzz", "jacket", "pants"],
];

for (const [label, g, view, hair, top, bot] of tests) {
  const base = load(`${g}-base-${view}`);
  const hairL = load(`${g}-hair-${hair}-${view}-layer`);
  const topL = load(`${g}-top-${top}-${view}-layer`);
  const botL = load(`${g}-bot-${bot}-${view}-layer`);
  if (!base) {
    console.log("test skip, no base", label);
    continue;
  }
  const out = stack(base, [botL, topL, hairL]);
  save(label, out, TEST);
  console.log("TEST", label, "hair", !!hairL, "top", !!topL, "bot", !!botL, "opaque", opaqueCount(out));
}

const manPath = path.join(DIR, "manifest.json");
const man = JSON.parse(fs.readFileSync(manPath, "utf8"));
const extra = fs.readdirSync(DIR).filter((f) => /-(base-|top-|bot-).+\.png$/i.test(f) || /-hair-.*-layer\.png$/i.test(f));
const set = new Set(man);
for (const f of extra) set.add(f);
const next = [...set].sort();
fs.writeFileSync(manPath, JSON.stringify(next, null, 2) + "\n");
console.log("manifest", next.length);
console.log("done");
