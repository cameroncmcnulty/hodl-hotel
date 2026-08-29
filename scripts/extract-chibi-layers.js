/**
 * Strict aligned layers from the new boy/girl sprites.
 * Base keeps face, hands, and skin legs — not the hoodie/hair silhouette.
 * Each garment layer is flood-filled from its own color only.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const TEST = path.join(__dirname, "avatar-tests");
fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(TEST, { recursive: true });

const BOY =
  "C:/Users/camer/.grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/assets/image-9aa8f981-7da5-4b50-857e-ed2646e86e58.png";
const GIRL =
  "C:/Users/camer/.grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/assets/image-11aaf135-a5ca-4cae-86c4-a52899542fbc.png";

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
  return r < 22 && g < 22 && b < 22;
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
  const dx = (xn - 0.5) / 0.13;
  const dy = (yn - 0.3) / 0.09;
  return dx * dx + dy * dy <= 1;
}
function inFace(xn, yn) {
  return yn > 0.24 && yn < 0.4 && xn > 0.34 && xn < 0.66;
}

function flood(src, seedFn, growFn) {
  const w = src.width;
  const h = src.height;
  const mark = Buffer.alloc(w * h);
  const stack = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = px(src, x, y);
      if (seedFn(p[0], p[1], p[2], p[3], y / h, x / w)) {
        mark[y * w + x] = 1;
        stack.push(y * w + x);
      }
    }
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i / w) | 0;
    const nbs = [i - 1, i + 1, i - w, i + w];
    for (const j of nbs) {
      if (j < 0 || j >= w * h) continue;
      if (mark[j]) continue;
      const nx = j % w;
      const ny = (j / w) | 0;
      if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
      const p = px(src, nx, ny);
      if (!growFn(p[0], p[1], p[2], p[3], ny / h, nx / w)) continue;
      mark[j] = 1;
      stack.push(j);
    }
  }
  const out = blank(w, h);
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mark[y * w + x]) continue;
      const p = px(src, x, y);
      setPx(out, x, y, p[0], p[1], p[2], 255);
      n++;
    }
  }
  out.n = n;
  return out;
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

function makeBase(src, gender) {
  const skin = sampleSkin(src);
  const out = blank(src.width, src.height);
  const w = src.width;
  const h = src.height;
  for (let y = 0; y < h; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const xn = x / w;
      const [r, g, b, a] = px(src, x, y);
      if (isBg(r, g, b, a)) continue;
      if (isSkin(r, g, b)) {
        setPx(out, x, y, r, g, b, 255);
        continue;
      }
      if (isOutline(r, g, b) && inFace(xn, yn)) {
        setPx(out, x, y, r, g, b, 255);
        continue;
      }
      if (isHair(r, g, b) && inScalp(xn, yn)) {
        setPx(out, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      const top = gender === "f" ? isPink(r, g, b) : isGray(r, g, b);
      if (top) continue;
      const bot = gender === "f" ? isNavy(r, g, b) : isDark(r, g, b);
      if (bot || isRed(r, g, b) || (isWhiteish(r, g, b) && yn > 0.72)) {
        setPx(out, x, y, skin[0], skin[1], skin[2], 255);
        continue;
      }
      if (isOutline(r, g, b) && yn > 0.38) {
        const up = y > 0 ? px(src, x, y - 1) : [0, 0, 0, 0];
        if (isSkin(up[0], up[1], up[2]) || isDark(up[0], up[1], up[2]) || isNavy(up[0], up[1], up[2])) {
          setPx(out, x, y, r, g, b, 255);
        }
      }
    }
  }
  return out;
}

function hairLayer(src) {
  return flood(
    src,
    (r, g, b, a, yn) => !isBg(r, g, b, a) && isHair(r, g, b) && yn < 0.5,
    (r, g, b, a, yn, xn) => {
      if (isBg(r, g, b, a) || yn > 0.5) return false;
      if (isHair(r, g, b)) return true;
      if (isOutline(r, g, b) && !inFace(xn, yn)) return true;
      return false;
    }
  );
}

function topLayer(src, gender) {
  return flood(
    src,
    (r, g, b, a, yn) => {
      if (isBg(r, g, b, a) || yn < 0.34 || yn > 0.64) return false;
      if (isSkin(r, g, b) || isHair(r, g, b)) return false;
      return gender === "f" ? isPink(r, g, b) : isGray(r, g, b);
    },
    (r, g, b, a, yn) => {
      if (isBg(r, g, b, a) || yn < 0.32 || yn > 0.66) return false;
      if (isSkin(r, g, b) || isHair(r, g, b) || isRed(r, g, b)) return false;
      if (gender === "f") return isPink(r, g, b) || isOutline(r, g, b);
      return isGray(r, g, b) || isOutline(r, g, b);
    }
  );
}

function botLayer(src, gender) {
  return flood(
    src,
    (r, g, b, a, yn) => {
      if (isBg(r, g, b, a) || yn < 0.56 || yn > 0.82) return false;
      if (isSkin(r, g, b) || isHair(r, g, b) || isRed(r, g, b) || isGray(r, g, b) || isPink(r, g, b)) return false;
      return gender === "f" ? isNavy(r, g, b) : isDark(r, g, b);
    },
    (r, g, b, a, yn) => {
      if (isBg(r, g, b, a) || yn < 0.54 || yn > 0.84) return false;
      if (isSkin(r, g, b) || isHair(r, g, b) || isRed(r, g, b) || isGray(r, g, b) || isPink(r, g, b)) return false;
      if (gender === "f") return isNavy(r, g, b) || isOutline(r, g, b);
      return isDark(r, g, b) || isOutline(r, g, b);
    }
  );
}

function shoeLayer(src) {
  return flood(
    src,
    (r, g, b, a, yn) => {
      if (isBg(r, g, b, a) || yn < 0.72) return false;
      return isRed(r, g, b) || isWhiteish(r, g, b);
    },
    (r, g, b, a, yn) => {
      if (isBg(r, g, b, a) || yn < 0.7) return false;
      if (isSkin(r, g, b) || isHair(r, g, b)) return false;
      return isRed(r, g, b) || isWhiteish(r, g, b) || isOutline(r, g, b);
    }
  );
}

function stack(base, layers) {
  const out = { width: base.width, height: base.height, data: Buffer.from(base.data) };
  for (const layer of layers) {
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

const boy = loadPng(BOY);
const girl = loadPng(GIRL);
save("m-se-idle", keyBg(boy));
save("f-se-idle", keyBg(girl));

const b = {
  base: makeBase(boy, "m"),
  hair: hairLayer(boy),
  top: topLayer(boy, "m"),
  bot: botLayer(boy, "m"),
  shoe: shoeLayer(boy),
};
const g = {
  base: makeBase(girl, "f"),
  hair: hairLayer(girl),
  top: topLayer(girl, "f"),
  bot: botLayer(girl, "f"),
  shoe: shoeLayer(girl),
};

save("m-base-se", b.base);
save("m-hair-short-se-layer", b.hair);
save("m-top-hoodie-se-layer", b.top);
save("m-bot-pants-se-layer", b.bot);
save("m-shoe-sneakers-se-layer", b.shoe);
save("f-base-se", g.base);
save("f-hair-pony-se-layer", g.hair);
save("f-top-hoodie-se-layer", g.top);
save("f-bot-skirt-se-layer", g.bot);
save("f-shoe-sneakers-se-layer", g.shoe);
save("boy-stack", stack(b.base, [b.shoe, b.bot, b.top, b.hair]), TEST);
save("girl-stack", stack(g.base, [g.shoe, g.bot, g.top, g.hair]), TEST);

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

console.log("boy", { base: opaque(b.base), hair: b.hair.n, top: b.top.n, bot: b.bot.n, shoe: b.shoe.n, stack: opaque(stack(b.base, [b.shoe, b.bot, b.top, b.hair])) });
console.log("girl", { base: opaque(g.base), hair: g.hair.n, top: g.top.n, bot: g.bot.n, shoe: g.shoe.n, stack: opaque(stack(g.base, [g.shoe, g.bot, g.top, g.hair])) });
console.log("done");
