/**
 * Extract aligned layers from the new boy/girl pixel sprites.
 * Base = skin/face with clothes filled to skin. Each garment is its own layer.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const TEST = path.join(__dirname, "avatar-tests");
fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(TEST, { recursive: true });

const BOY = "C:/Users/camer/.grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/assets/image-9aa8f981-7da5-4b50-857e-ed2646e86e58.png";
const GIRL = "C:/Users/camer/.grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/assets/image-11aaf135-a5ca-4cae-86c4-a52899542fbc.png";

function loadPng(f) {
  return PNG.sync.read(fs.readFileSync(f));
}
function save(name, img, dest = DIR) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(path.join(dest, name + ".png"), PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
}
function blank(w, h) {
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 0;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
  return { width: w, height: h, data };
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

function isBg(r, g, b, a) {
  if (a < 8) return true;
  return r > 242 && g > 242 && b > 242;
}
function isOutline(r, g, b) {
  return r < 18 && g < 18 && b < 18;
}
function isSkin(r, g, b) {
  return r > 220 && g > 145 && g < 220 && b > 100 && b < 190 && r - b > 40 && r > g;
}
function isHair(r, g, b) {
  if (r > 160) return false;
  return r > 55 && r < 150 && g > 25 && g < 95 && b < 55 && r > g + 15 && g >= b - 8;
}
function isGray(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx - mn < 22 && mx > 90 && mx < 190;
}
function isPink(r, g, b) {
  return r > 200 && g > 70 && g < 190 && b > 120 && b < 210 && r - g > 40;
}
function isNavy(r, g, b) {
  return b > r + 15 && b > g && r < 80 && g < 90 && b < 160;
}
function isDark(r, g, b) {
  return r < 55 && g < 55 && b < 55 && !isOutline(r, g, b);
}
function isRed(r, g, b) {
  return r > 130 && g < 90 && b < 90 && r > g * 1.8;
}
function isWhiteish(r, g, b) {
  return r > 200 && g > 200 && b > 200 && r < 248;
}

function inScalp(xn, yn) {
  const dx = (xn - 0.5) / 0.14;
  const dy = (yn - 0.3) / 0.1;
  return dx * dx + dy * dy <= 1;
}

function classify(r, g, b, a, yn, gender) {
  if (isBg(r, g, b, a)) return "bg";
  if (isSkin(r, g, b)) return "skin";
  if (isHair(r, g, b) && yn < 0.5) return "hair";
  if (gender === "f") {
    if (isPink(r, g, b) && yn > 0.34 && yn < 0.72) return "top";
    if (isNavy(r, g, b) && yn > 0.58 && yn < 0.82) return "bot";
    if (isRed(r, g, b) && yn > 0.72) return "shoe";
    if (isWhiteish(r, g, b) && yn > 0.78) return "shoe";
  } else {
    if (isGray(r, g, b) && yn > 0.34 && yn < 0.66) return "top";
    if (isDark(r, g, b) && yn > 0.56 && yn < 0.82) return "bot";
    if (isRed(r, g, b) && yn > 0.72) return "shoe";
    if (isWhiteish(r, g, b) && yn > 0.74) return "shoe";
  }
  if (isOutline(r, g, b) || isDark(r, g, b)) return "ink";
  return "other";
}

function sampleSkin(img) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const y0 = Math.floor(img.height * 0.26);
  const y1 = Math.floor(img.height * 0.4);
  const x0 = Math.floor(img.width * 0.35);
  const x1 = Math.floor(img.width * 0.65);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = px(img, x, y);
      if (isSkin(p[0], p[1], p[2])) {
        r += p[0];
        g += p[1];
        b += p[2];
        n++;
      }
    }
  }
  if (!n) return [255, 196, 136];
  return [(r / n) | 0, (g / n) | 0, (b / n) | 0];
}

function extract(src, gender) {
  const w = src.width;
  const h = src.height;
  const cls = new Array(w * h);
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = px(src, x, y);
      cls[y * w + x] = classify(r, g, b, a, yn, gender);
    }
  }
  // ink inherits nearest non-ink class
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (cls[i] !== "ink" && cls[i] !== "other") continue;
      const counts = {};
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const c = cls[ny * w + nx];
          if (c && c !== "ink" && c !== "other" && c !== "bg") counts[c] = (counts[c] || 0) + 1;
        }
      }
      const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (best) cls[i] = best[0];
      else if (cls[i] === "other") cls[i] = "skin";
    }
  }

  const skin = sampleSkin(src);
  const layers = {
    base: blank(w, h),
    hair: blank(w, h),
    top: blank(w, h),
    bot: blank(w, h),
    shoe: blank(w, h),
  };
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const c = cls[y * w + x];
      const [r, g, b, a] = px(src, x, y);
      if (c === "bg") continue;
      if (yn < 0.2 && !inScalp(x / w, yn)) {
        if (c !== "skin") setPx(layers.hair, x, y, r, g, b, 255);
        continue;
      }
      if ((c === "hair" || c === "ink") && yn < 0.48 && !inScalp(x / w, yn)) {
        setPx(layers.hair, x, y, r, g, b, 255);
        continue;
      }
      if (c === "skin") {
        setPx(layers.base, x, y, r, g, b, 255);
        continue;
      }
      if (c === "hair") {
        setPx(layers.hair, x, y, r, g, b, 255);
        const xn = x / w;
        if (inScalp(xn, yn)) setPx(layers.base, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (c === "top") {
        setPx(layers.top, x, y, r, g, b, 255);
        setPx(layers.base, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (c === "bot") {
        setPx(layers.bot, x, y, r, g, b, 255);
        setPx(layers.base, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (c === "shoe") {
        setPx(layers.shoe, x, y, r, g, b, 255);
        setPx(layers.base, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (c === "ink") {
        if (yn < 0.42 && !inScalp(x / w, yn)) continue;
        setPx(layers.base, x, y, r, g, b, 255);
      }
    }
  }
  return layers;
}

function stack(base, parts) {
  const out = { width: base.width, height: base.height, data: Buffer.from(base.data) };
  for (const layer of parts) {
    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        const [r, g, b, a] = px(layer, x, y);
        if (a < 16) continue;
        if (r > 250 && g < 8 && b > 250) continue;
        setPx(out, x, y, r, g, b, 255);
      }
    }
  }
  return out;
}

function opaque(img) {
  let n = 0;
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i],
      g = img.data[i + 1],
      b = img.data[i + 2],
      a = img.data[i + 3];
    if (a > 16 && !(r > 250 && g < 8 && b > 250)) n++;
  }
  return n;
}

function keyBg(src) {
  const out = blank(src.width, src.height);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const [r, g, b, a] = px(src, x, y);
      if (isBg(r, g, b, a)) continue;
      setPx(out, x, y, r, g, b, 255);
    }
  }
  return out;
}

const boy = loadPng(BOY);
const girl = loadPng(GIRL);
save("m-se-idle", keyBg(boy));
save("f-se-idle", keyBg(girl));

const b = extract(boy, "m");
save("m-base-se", b.base);
save("m-hair-short-se-layer", b.hair);
save("m-top-hoodie-se-layer", b.top);
save("m-bot-pants-se-layer", b.bot);
save("m-shoe-sneakers-se-layer", b.shoe);
save("boy-stack", stack(b.base, [b.shoe, b.bot, b.top, b.hair]), TEST);

const g = extract(girl, "f");
save("f-base-se", g.base);
save("f-hair-pony-se-layer", g.hair);
save("f-top-hoodie-se-layer", g.top);
save("f-bot-skirt-se-layer", g.bot);
save("f-shoe-sneakers-se-layer", g.shoe);
save("girl-stack", stack(g.base, [g.shoe, g.bot, g.top, g.hair]), TEST);

function flipH(img) {
  const out = blank(img.width, img.height);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const [r, g, b, a] = px(img, img.width - 1 - x, y);
      setPx(out, x, y, r, g, b, a);
    }
  }
  return out;
}
for (const [gnd, L, hair, top, bot] of [
  ["m", b, "short", "hoodie", "pants"],
  ["f", g, "pony", "hoodie", "skirt"],
]) {
  save(`${gnd}-base-ne`, flipH(L.base));
  save(`${gnd}-hair-${hair}-ne-layer`, flipH(L.hair));
  save(`${gnd}-top-${top}-ne-layer`, flipH(L.top));
  save(`${gnd}-bot-${bot}-ne-layer`, flipH(L.bot));
  save(`${gnd}-shoe-sneakers-ne-layer`, flipH(L.shoe));
  save(`${gnd}-ne-idle`, flipH(keyBg(gnd === "m" ? boy : girl)));
}

console.log("boy", {
  base: opaque(b.base),
  hair: opaque(b.hair),
  top: opaque(b.top),
  bot: opaque(b.bot),
  shoe: opaque(b.shoe),
  stack: opaque(stack(b.base, [b.shoe, b.bot, b.top, b.hair])),
  idle: opaque(keyBg(boy)),
});
console.log("girl", {
  base: opaque(g.base),
  hair: opaque(g.hair),
  top: opaque(g.top),
  bot: opaque(g.bot),
  shoe: opaque(g.shoe),
  stack: opaque(stack(g.base, [g.shoe, g.bot, g.top, g.hair])),
  idle: opaque(keyBg(girl)),
});
console.log("done");
