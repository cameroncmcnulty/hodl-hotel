import type { Figure } from "../types";
import { mix } from "./pix";

export const SKIN = [
  "#ffe9dc",
  "#fbe0c8",
  "#f3d1b0",
  "#e8c19a",
  "#d4a574",
  "#c48a56",
  "#b56c3a",
  "#a05a32",
  "#8d4e24",
  "#7a4528",
  "#6b3a20",
  "#5a2e18",
  "#4a2414",
  "#3a1c10",
  "#29140c",
  "#1a0e08",
];
export const EYES = ["#3b2214", "#5c3317", "#8b5a2b", "#3d5c2e", "#2e5aa6", "#4a6274", "#b8860b", "#1a1a1a"];
export const FACE = ["default", "almond", "round", "lash"];
export const EYE_LABEL = ["dark brown", "brown", "hazel", "green", "blue", "gray", "amber", "black"];
export const HAIR_C = [
  "#1e5a68",
  "#1b1b1b",
  "#4a2c0a",
  "#c45c26",
  "#e8d07a",
  "#6b3fa0",
  "#14F195",
  "#ff6b5a",
  "#f5c542",
  "#2ec4b6",
  "#dfe7ff",
  "#f4e4d4",
];
export const TOPS = ["#1a1a1e", "#ff6b5a", "#9945FF", "#14F195", "#2ec4b6", "#f5c542", "#ffffff", "#ff8fab", "#3b82f6", "#24143d"];
export const BOTTOMS = ["#2a3340", "#1e3a5f", "#4b5563", "#7c3aed", "#0f766e", "#9a3412", "#111111", "#f5c542"];
export const SHOES = ["#f4f4f6"];
export const HAIR_BOY = ["spike", "buzz", "mohawk", "undercut", "crop", "side"];
export const HAIR_GIRL = ["long", "bob", "pony", "bun", "curl", "bangs", "twin"];
export const TOP_BOY = ["hoodie", "tee", "jacket", "sweater", "tank", "shirt"];
export const TOP_GIRL = ["hoodie", "crop", "blouse", "cardi", "cami", "wrap"];
export const BOT_BOY = ["pants", "shorts", "cargo", "joggers", "jeans"];
export const BOT_GIRL = ["pants", "shorts", "skirt", "dress", "leggings", "pleat"];
export const HAIR_STYLES = HAIR_BOY;
export const TOP_CUTS = TOP_BOY;
export const BOT_CUTS = BOT_GIRL;
export const ACC = ["none", "glasses", "shades", "headphones", "scarf", "pack", "visor", "bow"];
export const GENDERS = ["boy", "girl"];

export function hairsFor(gender: number) {
  return gender === 1 ? HAIR_GIRL : HAIR_BOY;
}
export function topsFor(gender: number) {
  return gender === 1 ? TOP_GIRL : TOP_BOY;
}
export function botsFor(gender: number) {
  return gender === 1 ? BOT_GIRL : BOT_BOY;
}
export function defaultHairName(gender: number) {
  return gender === 1 ? "long" : "spike";
}

export const DEFAULT_FIGURE: Figure = {
  gender: 0,
  skin: 1,
  hair: 0,
  hairColor: 0,
  top: 0,
  bottom: 0,
  shoes: 0,
  acc: 0,
  topCut: 0,
  botCut: 0,
  eyes: 0,
  face: 0,
};

export const AVATAR_DRAW_H = 128;
export const AVATAR_NAME_LIFT = 138;
export const SPRITE_W = 384;
export const SPRITE_H = 576;

const sprites = new Map<string, HTMLCanvasElement>();
let loadPromise: Promise<void> | null = null;

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  const gender = n(f?.gender, GENDERS.length - 1);
  return {
    gender,
    skin: n(f?.skin, SKIN.length - 1),
    hair: n(f?.hair, hairsFor(gender).length - 1),
    hairColor: n(f?.hairColor, HAIR_C.length - 1),
    top: n(f?.top, TOPS.length - 1),
    bottom: n(f?.bottom, BOTTOMS.length - 1),
    shoes: 0,
    acc: n(f?.acc, ACC.length - 1),
    topCut: n(f?.topCut, topsFor(gender).length - 1),
    botCut: n(f?.botCut, botsFor(gender).length - 1),
    eyes: n(f?.eyes, EYES.length - 1),
    face: n(f?.face, FACE.length - 1),
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function loadAvatars() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const man = (await fetch("/art/avatars/manifest.json?v=17")
        .then((r) => r.json())
        .catch(() => [])) as string[];
      await Promise.all(
        man.map(async (file) => {
          const img = await loadImage(`/art/avatars/${file}?v=17`);
          if (!img) return;
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d")!;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0);
          sprites.set(file.replace(/\.png$/i, ""), c);
        })
      );
    })();
  }
  return loadPromise;
}

export function avatarsReady() {
  return sprites.size > 0;
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lum(r: number, g: number, b: number) {
  return (r * 0.32 + g * 0.5 + b * 0.18) / 255;
}

function tint(r: number, g: number, b: number, target: [number, number, number]): [number, number, number] {
  const L = lum(r, g, b);
  const tL = Math.max(0.08, lum(target[0], target[1], target[2]));
  const k = L / tL;
  return [
    Math.max(0, Math.min(255, Math.round(target[0] * k))),
    Math.max(0, Math.min(255, Math.round(target[1] * k))),
    Math.max(0, Math.min(255, Math.round(target[2] * k))),
  ];
}

function isHairPx(r: number, g: number, b: number) {
  return isLooseHair(r, g, b);
}

function isSkinPx(r: number, g: number, b: number) {
  if (isPurplePx(r, g, b)) return false;
  if (r < 48 || g < 22) return false;
  if (r > 252 && g > 252 && b > 252) return false;
  return r > g - 8 && g >= b - 18 && r - b > 8 && g < 235 && b < 220 && r < 256;
}

function mapSkin(r: number, g: number, b: number, target: [number, number, number]): [number, number, number] {
  const srcL = lum(r, g, b);
  const tL = Math.max(0.05, lum(target[0], target[1], target[2]));
  const delta = srcL - 0.78;
  const spread = tL < 0.22 ? 0.4 : tL < 0.4 ? 0.55 : 0.7;
  const outL = Math.max(0.04, Math.min(0.96, tL + delta * spread));
  const scale = outL / tL;
  return [
    Math.max(0, Math.min(255, Math.round(target[0] * scale))),
    Math.max(0, Math.min(255, Math.round(target[1] * scale))),
    Math.max(0, Math.min(255, Math.round(target[2] * scale))),
  ];
}

function isPurplePx(r: number, g: number, b: number) {
  return r > 55 && b > 85 && g < 100 && b > g + 18 && Math.abs(r - b) < 90;
}

function isIrisPx(r: number, g: number, b: number, yn: number, xn: number) {
  if (yn < 0.2 || yn > 0.31) return false;
  if (xn < 0.33 || xn > 0.67) return false;
  if (isSkinPx(r, g, b) || isLooseHair(r, g, b) || isPurplePx(r, g, b)) return false;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx > 200 && mx - mn < 30) return false;
  return lum(r, g, b) < 0.38 && mx < 120;
}

function applyEyesAndFace(d: Uint8ClampedArray, w: number, h: number, fig: Figure) {
  const eyeT = hexRgb(EYES[fig.eyes ?? 0] || EYES[0]);
  const face = fig.face ?? 0;
  const iris: { x: number; y: number }[] = [];
  for (let y = Math.floor(h * 0.2); y < Math.floor(h * 0.32); y++) {
    for (let x = Math.floor(w * 0.32); x < Math.floor(w * 0.68); x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 16) continue;
      if (!isIrisPx(d[i], d[i + 1], d[i + 2], y / h, x / w)) continue;
      const t = tint(d[i], d[i + 1], d[i + 2], eyeT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      iris.push({ x, y });
    }
  }
  if (!face || !iris.length) return;
  const dark = [Math.max(0, eyeT[0] - 40), Math.max(0, eyeT[1] - 40), Math.max(0, eyeT[2] - 40)];
  const paint = (x: number, y: number, col: number[]) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4;
    if (d[i + 3] < 12) return;
    d[i] = col[0];
    d[i + 1] = col[1];
    d[i + 2] = col[2];
    d[i + 3] = 255;
  };
  for (const p of iris) {
    if (face === 1) {
      const left = p.x < w / 2;
      paint(p.x + (left ? -2 : 2), p.y, dark);
      paint(p.x + (left ? -3 : 3), p.y, dark);
    } else if (face === 2) {
      paint(p.x, p.y + 1, [d[(p.y * w + p.x) * 4], d[(p.y * w + p.x) * 4 + 1], d[(p.y * w + p.x) * 4 + 2]]);
      paint(p.x + 1, p.y, dark);
      paint(p.x - 1, p.y, dark);
    } else if (face === 3) {
      paint(p.x, p.y - 1, [20, 16, 16]);
      paint(p.x + 1, p.y - 1, [20, 16, 16]);
    }
  }
}

const recache = new Map<string, HTMLCanvasElement>();

function recolor(src: HTMLCanvasElement, fig: Figure, id: string) {
  const tagged = `${id}.${fig.skin}.${fig.hairColor}.${fig.top}.${fig.bottom}.${fig.shoes}.${fig.eyes ?? 0}.${fig.face ?? 0}`;
  const hit = recache.get(tagged);
  if (hit) return hit;
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const d = data.data;
  const hairT = hexRgb(HAIR_C[fig.hairColor]);
  const skinT = hexRgb(SKIN[fig.skin]);
  const topT = hexRgb(TOPS[fig.top]);
  const botT = hexRgb(BOTTOMS[fig.bottom]);
  const h = out.height;
  for (let i = 0, y = 0; i < d.length; i += 4) {
    const px = (i / 4) | 0;
    y = (px / out.width) | 0;
    const a = d[i + 3];
    if (a < 12) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    const yn = y / h;
    if (isLooseHair(r, g, b) && yn < 0.38) {
      const t = tint(r, g, b, hairT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (isSkinPx(r, g, b)) {
      const t = mapSkin(r, g, b, skinT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (isPurplePx(r, g, b)) continue;
    if (isLooseHair(r, g, b)) continue;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    if (fig.bottom !== 0 && yn > 0.52 && yn < 0.82 && mx < 90) {
      const t = tint(r, g, b, botT);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      continue;
    }
    if (fig.top !== 0 && yn > 0.34 && yn < 0.6 && !isSkinPx(r, g, b)) {
      if (mx < 95 || (mn > 150 && yn < 0.58)) {
        const t = tint(r, g, b, topT);
        d[i] = t[0];
        d[i + 1] = t[1];
        d[i + 2] = t[2];
      }
    }
  }
  applyEyesAndFace(d, out.width, out.height, fig);
  ctx.putImageData(data, 0, 0);
  recache.set(tagged, out);
  if (recache.size > 220) {
    const first = recache.keys().next().value;
    if (first) recache.delete(first);
  }
  return out;
}

function gKey(fig: Figure) {
  return fig.gender === 1 ? "f" : "m";
}

function viewOf(dir: 0 | 1 | 2 | 3) {
  return dir === 2 || dir === 3 ? "ne" : "se";
}

/** Unflipped 3/4 faces SW (+y). Flip for SE (+x) and NE (-y). */
function flipOf(dir: 0 | 1 | 2 | 3) {
  return dir === 0 || dir === 3;
}

function spr(id: string) {
  return sprites.get(id) || null;
}

function firstSpr(ids: string[]) {
  for (const id of ids) {
    const s = sprites.get(id);
    if (s) return { id, src: s };
  }
  return null;
}

function hairName(fig: Figure) {
  return hairsFor(fig.gender ?? 0)[fig.hair] || defaultHairName(fig.gender ?? 0);
}
function topName(fig: Figure) {
  return topsFor(fig.gender ?? 0)[fig.topCut ?? 0] || "hoodie";
}
function botName(fig: Figure) {
  return botsFor(fig.gender ?? 0)[fig.botCut ?? 0] || "pants";
}

function clothesSpr(g: string, kind: "top" | "bot", name: string, view: string) {
  return firstSpr([`${g}-${kind}-${name}-${view}`, `${g}-${kind}-${name}-se`]);
}

function hairSprite(fig: Figure, view: string) {
  const g = gKey(fig);
  const hair = hairName(fig);
  const def = defaultHairName(fig.gender ?? 0);
  if (hair === def) return null;
  return firstSpr([`${g}-hair-${hair}-${view}`, `${g}-hair-${hair}-se`]);
}

function pickPose(fig: Figure, dir: 0 | 1 | 2 | 3, walking: boolean, sit: boolean, frame: number) {
  const g = gKey(fig);
  const view = viewOf(dir);
  if (sit) return firstSpr([`${g}-se-sit`, `${g}-se-idle`]);
  if (walking) {
    const which = frame % 2;
    return firstSpr([`${g}-${view}-walk${which}`, `${g}-se-walk${which}`, `${g}-se-walk0`, `${g}-se-walk1`, `${g}-se-idle`]);
  }
  const styled = hairSprite(fig, view);
  if (styled) return styled;
  return firstSpr([`${g}-${view}-idle`, `${g}-se-idle`]);
}

function isShoePx(r: number, g: number, b: number, yn: number) {
  if (yn < 0.84) return false;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx > 165 && mx - mn < 55;
}

function isGarmentPx(r: number, g: number, b: number) {
  if (isSkinPx(r, g, b) || isLooseHair(r, g, b) || isPurplePx(r, g, b)) return false;
  return true;
}

function replaceTop(dst: HTMLCanvasElement, src: HTMLCanvasElement) {
  const dctx = dst.getContext("2d")!;
  const dd = dctx.getImageData(0, 0, dst.width, dst.height);
  const sd = src.getContext("2d")!.getImageData(0, 0, src.width, src.height);
  const d = dd.data;
  const s = sd.data;
  const w = Math.min(dst.width, src.width);
  const h = Math.min(dst.height, src.height);
  const y0 = Math.floor(h * 0.16);
  const y1 = Math.floor(h * 0.6);
  const scalp = sampleScalp(dst);
  const dw = dst.width;
  const sw = src.width;
  for (let y = y0; y <= y1; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const si = (y * sw + x) * 4;
      const di = (y * dw + x) * 4;
      if (s[si + 3] < 16) continue;
      const sr = s[si],
        sg = s[si + 1],
        sb = s[si + 2];
      if (isShoePx(sr, sg, sb, yn)) continue;
      if (yn > 0.58 && !isSkinPx(sr, sg, sb) && Math.max(sr, sg, sb) < 110) continue;
      if (isLooseHair(sr, sg, sb)) {
        if (d[di + 3] > 16 && isGarmentPx(d[di], d[di + 1], d[di + 2])) {
          d[di] = scalp[0];
          d[di + 1] = scalp[1];
          d[di + 2] = scalp[2];
          d[di + 3] = 255;
        }
        continue;
      }
      d[di] = sr;
      d[di + 1] = sg;
      d[di + 2] = sb;
      d[di + 3] = s[si + 3];
    }
  }
  dctx.putImageData(dd, 0, 0);
}

function replaceBot(dst: HTMLCanvasElement, src: HTMLCanvasElement, longHem: boolean) {
  const dctx = dst.getContext("2d")!;
  const dd = dctx.getImageData(0, 0, dst.width, dst.height);
  const sd = src.getContext("2d")!.getImageData(0, 0, src.width, src.height);
  const d = dd.data;
  const s = sd.data;
  const w = Math.min(dst.width, src.width);
  const h = Math.min(dst.height, src.height);
  const y0 = Math.floor(h * (longHem ? 0.48 : 0.56));
  const y1 = Math.floor(h * 0.88);
  const dw = dst.width;
  const sw = src.width;
  for (let y = y0; y <= y1; y++) {
    const yn = y / h;
    for (let x = 0; x < w; x++) {
      const si = (y * sw + x) * 4;
      if (s[si + 3] < 16) continue;
      const sr = s[si],
        sg = s[si + 1],
        sb = s[si + 2];
      if (isLooseHair(sr, sg, sb)) continue;
      if (isShoePx(sr, sg, sb, yn)) continue;
      if (yn < 0.57 && isGarmentPx(sr, sg, sb) && Math.max(sr, sg, sb) < 85) {
        const xn = x / w;
        if (xn > 0.28 && xn < 0.72) continue;
      }
      const di = (y * dw + x) * 4;
      d[di] = sr;
      d[di + 1] = sg;
      d[di + 2] = sb;
      d[di + 3] = s[si + 3];
    }
  }
  dctx.putImageData(dd, 0, 0);
}

function isLooseHair(r: number, g: number, b: number) {
  if (isSkinPx(r, g, b) || isPurplePx(r, g, b)) return false;
  if (r > 180 && g > 180 && b > 180) return false;
  if (r > 155) return false;
  if (g < 14) return false;
  if (g <= r + 5) return false;
  if (b <= r) return false;
  if (b < g * 0.5) return false;
  return true;
}

function extractHairOnly(src: HTMLCanvasElement) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, out.width, out.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16 || isSkinPx(d[i], d[i + 1], d[i + 2]) || !isLooseHair(d[i], d[i + 1], d[i + 2])) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

function sampleScalp(body: HTMLCanvasElement): [number, number, number] {
  const ctx = body.getContext("2d")!;
  const img = ctx.getImageData(0, 0, body.width, body.height);
  const d = img.data;
  const y0 = Math.floor(body.height * 0.24);
  const y1 = Math.floor(body.height * 0.36);
  const x0 = Math.floor(body.width * 0.38);
  const x1 = Math.floor(body.width * 0.62);
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * body.width + x) * 4;
      if (d[i + 3] > 20 && isSkinPx(d[i], d[i + 1], d[i + 2])) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
        n++;
      }
    }
  }
  if (!n) return [240, 196, 160];
  return [(r / n) | 0, (g / n) | 0, (b / n) | 0];
}

function layerHair(g: string, view: string, hair: string) {
  return spr(`${g}-hair-${hair}-${view}-layer`) || spr(`${g}-hair-${hair}-se-layer`);
}

function defaultHairMask(g: string, view: string) {
  return spr(`${g}-${view}-idle-layer`) || spr(`${g}-se-idle-layer`);
}

/** Cut the baked-in hairstyle off the pose, then draw only the chosen hair. */
function replaceHair(body: HTMLCanvasElement, g: string, view: string, hair: string) {
  const mask = defaultHairMask(g, view);
  const neu = layerHair(g, view, hair);
  const full = spr(`${g}-hair-${hair}-${view}`) || spr(`${g}-hair-${hair}-se`);
  const hairSrc = neu || (full ? extractHairOnly(full) : null);
  const ctx = body.getContext("2d")!;
  const bd = ctx.getImageData(0, 0, body.width, body.height);
  const b = bd.data;
  const w = body.width;
  const h = body.height;
  const scalp = sampleScalp(body);
  const hairMaxY = Math.floor(h * 0.55);
  const scalpTop = Math.floor(h * 0.12);
  const scalpBot = Math.floor(h * 0.38);
  const scalpL = Math.floor(w * 0.28);
  const scalpR = Math.floor(w * 0.72);
  const md = mask ? mask.getContext("2d")!.getImageData(0, 0, mask.width, mask.height).data : null;
  const mw = mask?.width || 0;

  const cut = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    if (b[i + 3] < 8) return;
    if (y >= scalpTop && y <= scalpBot && x >= scalpL && x <= scalpR) {
      b[i] = scalp[0];
      b[i + 1] = scalp[1];
      b[i + 2] = scalp[2];
      b[i + 3] = 255;
    } else {
      b[i + 3] = 0;
    }
  };

  for (let y = 0; y < hairMaxY; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (b[i + 3] < 8) continue;
      if (isLooseHair(b[i], b[i + 1], b[i + 2])) {
        cut(x, y);
        continue;
      }
      if (md && y < (mask?.height || 0) && x < mw) {
        const mi = (y * mw + x) * 4;
        if (md[mi + 3] > 24 && isLooseHair(md[mi], md[mi + 1], md[mi + 2])) cut(x, y);
      }
    }
  }

  if (hairSrc) {
    const hd = hairSrc.getContext("2d")!.getImageData(0, 0, hairSrc.width, hairSrc.height);
    const hair = hd.data;
    const hw = hairSrc.width;
    const hh = hairSrc.height;
    for (let y = 0; y < Math.min(h, hh); y++) {
      for (let x = 0; x < Math.min(w, hw); x++) {
        const hi = (y * hw + x) * 4;
        if (hair[hi + 3] < 20) continue;
        if (!isLooseHair(hair[hi], hair[hi + 1], hair[hi + 2])) continue;
        const i = (y * w + x) * 4;
        b[i] = hair[hi];
        b[i + 1] = hair[hi + 1];
        b[i + 2] = hair[hi + 2];
        b[i + 3] = hair[hi + 3];
      }
    }
  }
  ctx.putImageData(bd, 0, 0);
}

const composeCache = new Map<string, HTMLCanvasElement>();

function compose(fig: Figure, dir: 0 | 1 | 2 | 3, walking: boolean, sit: boolean, frame: number) {
  const g = gKey(fig);
  const view = viewOf(dir);
  const hair = hairName(fig);
  const top = topName(fig);
  const bot = botName(fig);
  const defHair = defaultHairName(fig.gender ?? 0);
  const body = pickPose(fig, dir, walking, sit, frame);
  if (!body) return null;

  const customTop = top !== "hoodie";
  const customBot = bot !== "pants";
  const usingHairBody = body.id.includes("-hair-");
  const needHair = hair !== defHair && !usingHairBody;
  const key = `${g}|pose|${body.id}|${top}|${bot}|${hair}|${view}|${frame}|v3`;
  const hit = composeCache.get(key);
  if (hit) return { id: key, src: hit };

  const out = document.createElement("canvas");
  out.width = body.src.width;
  out.height = body.src.height;
  out.getContext("2d")!.drawImage(body.src, 0, 0);

  if (!walking) {
    if (customTop) {
      const t = clothesSpr(g, "top", top, view);
      if (t) replaceTop(out, t.src);
    }
    if (customBot) {
      const b = clothesSpr(g, "bot", bot, view);
      if (b) replaceBot(out, b.src, bot === "dress" || bot === "skirt" || bot === "pleat");
    }
  }
  if (needHair) replaceHair(out, g, view, hair);

  composeCache.set(key, out);
  if (composeCache.size > 220) {
    const first = composeCache.keys().next().value;
    if (first) composeCache.delete(first);
  }
  return { id: key, src: out };
}

function blit(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, dx: number, dy: number, dw: number, dh: number, flip: boolean) {
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.save();
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(src, dx, dy, dw, dh);
  }
}

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 4, dir: 0 | 1 | 2 | 3 = 0) {
  const f = clampFigure(fig);
  const made = compose(f, dir, false, false, 0);
  const destH = Math.max(120, Math.round(36 * scale));
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const dx = Math.round(cx - destW / 2);
  const dy = Math.round(cy - destH * 0.92);
  if (!made) {
    ctx.fillStyle = "#14F195";
    ctx.fillRect(dx + destW * 0.3, dy + destH * 0.2, destW * 0.4, destH * 0.7);
    return;
  }
  blit(ctx, recolor(made.src, f, made.id), dx, dy, destW, destH, flipOf(dir));
}

export type AvatarDrawOpts = { dance?: boolean; walking?: boolean; sit?: boolean; dist?: number };

export function drawAvatarIso(
  ctx: CanvasRenderingContext2D,
  fig: Figure,
  sx: number,
  sy: number,
  dir: 0 | 1 | 2 | 3,
  t: number,
  opts: AvatarDrawOpts = {}
) {
  const f = clampFigure(fig);
  const walking = !!opts.walking;
  const dance = !!opts.dance;
  const sit = !!opts.sit && !walking;
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 2) % 2 : 0;
  const made = compose(f, dir, walking, sit, frame);
  const destH = sit ? AVATAR_DRAW_H - 14 : AVATAR_DRAW_H;
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const bob = dance ? (frame % 2 === 0 ? -3 : 0) : walking ? (frame % 2 === 0 ? 0 : -4) : 0;
  const dx = Math.round(sx - destW / 2);
  const dy = Math.round(sy - destH + 12 + bob + (sit ? 10 : 0));
  if (!made) return;
  blit(ctx, recolor(made.src, f, made.id), dx, dy, destW, destH, flipOf(dir));
}

export function shade(hex: string, amt: number) {
  const [r, g, b] = mix(hex, amt);
  return `rgb(${r},${g},${b})`;
}

export function isoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  top: string,
  left: string,
  right: string
) {
  const tw = w;
  const td = d;
  const topPts = [
    [x, y - h],
    [x + tw, y - h + tw * 0.5],
    [x + tw - td, y - h + (tw + td) * 0.5],
    [x - td, y - h + td * 0.5],
  ];
  const leftPts = [
    [x, y - h],
    [x - td, y - h + td * 0.5],
    [x - td, y + td * 0.5],
    [x, y],
  ];
  const rightPts = [
    [x, y - h],
    [x + tw, y - h + tw * 0.5],
    [x + tw, y + tw * 0.5],
    [x, y],
  ];
  const poly = (pts: number[][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  poly(topPts, top);
  poly(leftPts, left);
  poly(rightPts, right);
}
