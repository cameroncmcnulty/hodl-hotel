/**
 * Build a complete bald base plus one hair / shirt / pants layer per option.
 * Sources are always full-body sprites — never previously extracted layers.
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

/** Teal/cyan hair only — navy pants, cream clothes, and green plaid must not match in body zones. */
function isHair(r, g, b, a) {
  if (a < 16) return false;
  if (r > 140) return false;
  if (g < 28 || b < 36) return false;
  if (g < r + 22) return false;
  if (b < r + 28) return false;
  return true;
}

function isSkin(r, g, b, a) {
  if (a < 16) return false;
  if (r < 170 || g < 90 || g > 215) return false;
  if (b > 175) return false;
  if (r - g < 28) return false;
  if (r - b < 50) return false;
  if (g - b < 20) return false;
  return true;
}

function colorDist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function isShoe(r, g, b, a, yn) {
  if (a < 16 || yn < 0.84) return false;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx > 165 && mx - mn < 55;
}

function inScalp(xn, yn) {
  const cx = 0.5;
  const cy = 0.235;
  const rx = 0.12;
  const ry = 0.085;
  const dx = (xn - cx) / rx;
  const dy = (yn - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function inInnerFace(xn, yn) {
  return yn >= 0.155 && yn <= 0.278 && xn >= 0.4 && xn <= 0.6;
}

function sampleSkin(img) {
  const w = img.width;
  const h = img.height;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const y0 = Math.floor(h * 0.18);
  const y1 = Math.floor(h * 0.32);
  const x0 = Math.floor(w * 0.4);
  const x1 = Math.floor(w * 0.6);
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

function hairMask(src) {
  const h = src.height;
  const w = src.width;
  const mark = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    if (yn > 0.5) continue;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = px(src, x, y);
      if (isHair(r, g, b, a)) mark[y * w + x] = 1;
    }
  }
  const grown = Buffer.from(mark);
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    if (yn > 0.46) continue;
    for (let x = 0; x < w; x++) {
      if (mark[y * w + x]) continue;
      const [r, g, b, a] = px(src, x, y);
      if (a < 16 || isSkin(r, g, b, a)) continue;
      if (yn > 0.3 && lum(r, g, b) > 0.16) continue;
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (mark[ny * w + nx]) near = true;
        }
      }
      if (near) grown[y * w + x] = 1;
    }
  }
  return grown;
}

function extractHair(src) {
  const out = blank(src.width, src.height);
  const h = src.height;
  const w = src.width;
  const mark = hairMask(src);
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      if (!mark[y * w + x]) continue;
      if (yn > 0.3 && !isHair(...px(src, x, y))) continue;
      const [r, g, b, a] = px(src, x, y);
      if (a > 16) setPx(out, x, y, r, g, b, a);
    }
  }
  return out;
}

function extractTop(src, idle) {
  const out = blank(src.width, src.height);
  const h = src.height;
  const w = src.width;
  const srcHair = hairMask(src);
  const idleHair = idle ? hairMask(idle) : srcHair;
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    if (yn < 0.278 || yn > 0.568) continue;
    for (let x = 0; x < w; x++) {
      const xn = x / w;
      const i = y * w + x;
      const p = px(src, x, y);
      const [r, g, b, a] = p;
      if (a < 16) continue;
      if (isSkin(r, g, b, a)) continue;
      if (isShoe(r, g, b, a, yn)) continue;
      if (inInnerFace(xn, yn) || inScalp(xn, yn)) continue;
      if (yn < 0.32 && srcHair[i]) continue;
      if (idleHair[i]) continue;
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
    if (yn < 0.548 || yn > 0.845) continue;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = px(src, x, y);
      if (a < 16) continue;
      if (isSkin(r, g, b, a)) continue;
      if (isShoe(r, g, b, a, yn)) continue;
      setPx(out, x, y, r, g, b, a);
    }
  }
  return out;
}

function isFaceFeature(r, g, b, a, xn, yn) {
  if (!inInnerFace(xn, yn) || a < 16 || isHair(r, g, b, a)) return false;
  if (isSkin(r, g, b, a)) return true;
  const mx = Math.max(r, g, b);
  if (yn >= 0.175 && yn <= 0.255 && xn >= 0.42 && xn <= 0.58 && (mx > 200 || mx < 55)) return true;
  if (yn > 0.25 && yn <= 0.278 && mx < 160) return true;
  return false;
}

function makeBase(idle, slim) {
  const body = slim || idle;
  const out = clone(body);
  const skin = sampleSkin(idle);
  const h = idle.height;
  const w = idle.width;
  const idleH = hairMask(idle);
  const bodyH = hairMask(body);
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const [br, bg, bb, ba] = px(out, x, y);
      const [ir, ig, ib, ia] = px(idle, x, y);
      const xn = x / w;
      if (isShoe(ir, ig, ib, ia, yn)) {
        setPx(out, x, y, ir, ig, ib, ia);
        continue;
      }
      if (yn < 0.32 && ia > 8 && isFaceFeature(ir, ig, ib, ia, xn, yn)) {
        setPx(out, x, y, ir, ig, ib, ia);
        continue;
      }
      if (yn < 0.32 && ia > 8 && isSkin(ir, ig, ib, ia)) {
        setPx(out, x, y, ir, ig, ib, ia);
        continue;
      }
      if (ba < 8) continue;
      const hi = y * w + x;
      if (idleH[hi] || bodyH[hi] || isHair(br, bg, bb, ba) || isHair(ir, ig, ib, ia)) {
        if (inScalp(xn, yn) && yn >= 0.15 && yn <= 0.28) setPx(out, x, y, skin[0], skin[1], skin[2], 255);
        else setPx(out, x, y, 0, 0, 0, 0);
        continue;
      }
      if (isSkin(br, bg, bb, ba)) continue;
      if (yn < 0.278) {
        setPx(out, x, y, 0, 0, 0, 0);
        continue;
      }
      if (yn < 0.86) setPx(out, x, y, skin[0], skin[1], skin[2], 255);
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

function fullSrc(g, kind, name, view) {
  if (kind === "hair") {
    return load(`${g}-hair-${name}-${view}`) || load(`${g}-hair-${name}-se`);
  }
  if (kind === "top") {
    return load(`${g}-top-${name}-${view}`) || load(`${g}-top-${name}-se`);
  }
  return load(`${g}-bot-${name}-${view}`) || load(`${g}-bot-${name}-se`);
}

const views = ["se", "ne"];
const genders = [
  { g: "m", hairs: HAIR_BOY, tops: TOP_BOY, bots: BOT_BOY, defHair: "spike" },
  { g: "f", hairs: HAIR_GIRL, tops: TOP_GIRL, bots: BOT_GIRL, defHair: "long" },
];

const missing = [];

for (const { g, hairs, tops, bots, defHair } of genders) {
  for (const view of views) {
    const idle = load(`${g}-${view}-idle`) || (view === "ne" ? load(`${g}-se-idle`) : null);
    if (!idle) {
      missing.push(`${g}-${view}-idle`);
      continue;
    }
    const slimName = g === "f" ? "cami" : "tank";
    const slim = fullSrc(g, "top", slimName, view);
    const base = makeBase(idle, slim);
    save(`${g}-base-${view}`, base);
    console.log("base", `${g}-base-${view}`, opaqueCount(base));

    const defHairLayer = extractHair(idle);
    save(`${g}-hair-${defHair}-${view}-layer`, defHairLayer);
    console.log("hair", `${g}-hair-${defHair}-${view}-layer`, opaqueCount(defHairLayer));

    for (const name of hairs) {
      if (name === defHair) continue;
      const src = fullSrc(g, "hair", name, view) || idle;
      const layer = extractHair(src);
      save(`${g}-hair-${name}-${view}-layer`, layer);
      const n = opaqueCount(layer);
      console.log("hair", `${g}-hair-${name}-${view}-layer`, n);
      if (n < 400) missing.push(`thin-hair:${g}-hair-${name}-${view}`);
    }

    for (const name of tops) {
      const src = name === "hoodie" ? idle : fullSrc(g, "top", name, view);
      if (!src) {
        missing.push(`top:${g}-${name}-${view}`);
        continue;
      }
      const layer = extractTop(src, idle);
      save(`${g}-top-${name}-${view}-layer`, layer);
      const n = opaqueCount(layer);
      console.log("top", `${g}-top-${name}-${view}-layer`, n);
      if (n < 800) missing.push(`thin-top:${g}-top-${name}-${view}`);
    }

    for (const name of bots) {
      const src = name === "pants" ? idle : fullSrc(g, "bot", name, view);
      if (!src) {
        missing.push(`bot:${g}-${name}-${view}`);
        continue;
      }
      const layer = extractBot(src);
      save(`${g}-bot-${name}-${view}-layer`, layer);
      const n = opaqueCount(layer);
      console.log("bot", `${g}-bot-${name}-${view}-layer`, n);
      if (n < 800) missing.push(`thin-bot:${g}-bot-${name}-${view}`);
    }
  }
}

const tests = [
  ["boy-default", "m", "se", "spike", "hoodie", "pants"],
  ["boy-buzz-tee-shorts", "m", "se", "buzz", "tee", "shorts"],
  ["boy-mohawk-tank-cargo", "m", "se", "mohawk", "tank", "cargo"],
  ["boy-buzz-jacket-pants", "m", "se", "buzz", "jacket", "pants"],
  ["boy-crop-sweater-jeans", "m", "se", "crop", "sweater", "jeans"],
  ["boy-side-shirt-joggers", "m", "se", "side", "shirt", "joggers"],
  ["girl-default", "f", "se", "long", "hoodie", "pants"],
  ["girl-bob-blouse-skirt", "f", "se", "bob", "blouse", "skirt"],
  ["girl-pony-cami-shorts", "f", "se", "pony", "cami", "shorts"],
  ["girl-bun-wrap-dress", "f", "se", "bun", "wrap", "dress"],
  ["girl-curl-cardi-leggings", "f", "se", "curl", "cardi", "leggings"],
  ["girl-twin-tee-pleat", "f", "se", "twin", "tee", "pleat"],
];

const failed = [];
for (const [label, g, view, hair, top, bot] of tests) {
  const base = load(`${g}-base-${view}`);
  const hairL = load(`${g}-hair-${hair}-${view}-layer`);
  const topL = load(`${g}-top-${top}-${view}-layer`);
  const botL = load(`${g}-bot-${bot}-${view}-layer`);
  if (!base || !hairL || !topL || !botL) {
    failed.push(label + ":missing-layer");
    console.log("test skip", label, !!base, !!hairL, !!topL, !!botL);
    continue;
  }
  const out = stack(base, [botL, topL, hairL]);
  save(label, out, TEST);
  const n = opaqueCount(out);
  console.log("TEST", label, "opaque", n);
  if (n < 42000) failed.push(label + ":too-thin:" + n);
}

console.log("combo scan");
for (const { g, hairs, tops, bots } of genders) {
  const view = "se";
  const base = load(`${g}-base-${view}`);
  for (const hair of hairs) {
    for (const top of tops) {
      for (const bot of bots) {
        const hairL = load(`${g}-hair-${hair}-${view}-layer`);
        const topL = load(`${g}-top-${top}-${view}-layer`);
        const botL = load(`${g}-bot-${bot}-${view}-layer`);
        if (!base || !hairL || !topL || !botL) {
          failed.push(`${g}-${hair}-${top}-${bot}:missing`);
          continue;
        }
        const n = opaqueCount(stack(base, [botL, topL, hairL]));
        if (n < 42000) failed.push(`${g}-${hair}-${top}-${bot}:thin:${n}`);
      }
    }
  }
}

const manPath = path.join(DIR, "manifest.json");
const man = JSON.parse(fs.readFileSync(manPath, "utf8"));
const extra = fs.readdirSync(DIR).filter((f) => f.endsWith(".png"));
const set = new Set(man);
for (const f of extra) set.add(f);
const next = [...set].sort();
fs.writeFileSync(manPath, JSON.stringify(next, null, 2) + "\n");
console.log("manifest", next.length);
console.log("missing", missing);
console.log("failed", failed);
console.log("done");
