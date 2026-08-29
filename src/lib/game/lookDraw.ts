import type { Figure } from "../types";
import { Pix, rgb } from "./pix";

export const LOOK_W = 96;
export const LOOK_H = 176;
export const LOOK_SCALE = 1;

export const SKIN = ["#f3d4c4", "#e8c4a8", "#d4a574", "#c48a56", "#b56c3a", "#8d4e24", "#6b3a20", "#3a1c10"];
export const HAIR_BOY_C = ["#8b5a2b", "#5c3317", "#1b1b1b", "#e8d07a", "#c45c26", "#4a2c0a"];
export const HAIR_GIRL_C = ["#8b5a2b", "#1a1a1a", "#111111", "#e8d07a", "#c45c26", "#ff8fab"];
export const HAIR_C = HAIR_BOY_C;

export const HAIR_BOY = ["messy", "side", "afro", "undercut", "spikes", "mohawk"];
export const HAIR_GIRL = ["pony", "waves", "bob", "long", "pigtails", "bun"];
export const TOP_BOY = ["hoodie", "tee", "jacket", "tank", "sweater"];
export const TOP_GIRL = ["hoodie", "tee", "jacket", "tank", "sweater"];
export const BOT_BOY = ["pants", "shorts", "jeans", "cargo", "joggers"];
export const BOT_GIRL = ["skirt", "pants", "shorts", "jeans", "pleat"];
export const SHOE_BOY = ["sneakers", "hightops", "boots", "skate", "slides"];
export const SHOE_GIRL = ["sneakers", "hightops", "boots", "skate", "flats"];
export const HAIR_STYLES = HAIR_BOY;
export const TOP_CUTS = TOP_BOY;
export const BOT_CUTS = BOT_GIRL;
export const ACC = ["none"];
export const GENDERS = ["boy", "girl"];
export const SKIN_N = 8;
export const COLOR_N = 5;
export const HAIR_COLOR_N = 6;

const TOP_PAL: Record<string, string[]> = {
  "0-hoodie": ["#9a9a9a", "#1e3a8a", "#1a1a1e", "#c41e3a", "#166534"],
  "0-tee": ["#e8b931", "#c41e3a", "#f4f4f6", "#3b82f6", "#1a1a1e"],
  "0-jacket": ["#1a1a1e", "#6d4c2f", "#c41e3a", "#1e3a5f", "#6b7280"],
  "0-tank": ["#1a1a1e", "#f4f4f6", "#c41e3a", "#6b7280", "#1e3a8a"],
  "0-sweater": ["#c4a574", "#1e3a5f", "#7f1d1d", "#6b7280", "#166534"],
  "1-hoodie": ["#ff8fab", "#7c3aed", "#f4f4f6", "#9a9a9a", "#3b82f6"],
  "1-tee": ["#ff8fab", "#f4f4f6", "#e8b931", "#c41e3a", "#1a1a1e"],
  "1-jacket": ["#1a1a1e", "#ff8fab", "#7c3aed", "#f4f4f6", "#c41e3a"],
  "1-tank": ["#1a1a1e", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-sweater": ["#ff8fab", "#f3e0c8", "#c4b5fd", "#9a9a9a", "#c41e3a"],
};
const BOT_PAL: Record<string, string[]> = {
  "0-pants": ["#1a1a1e", "#1e3a5f", "#6d4c2f", "#9a9a9a", "#c4a574"],
  "0-shorts": ["#9a9a9a", "#1e3a5f", "#1a1a1e", "#c41e3a", "#166534"],
  "0-jeans": ["#2563eb", "#1e3a5f", "#1a1a1e", "#6b7280", "#93c5fd"],
  "0-cargo": ["#c4a574", "#3f4f2f", "#1a1a1e", "#6d4c2f", "#9a9a9a"],
  "0-joggers": ["#1a1a1e", "#6b7280", "#1e3a5f", "#c41e3a", "#3f4f2f"],
  "1-skirt": ["#1e3a8a", "#ff8fab", "#1a1a1e", "#9a9a9a", "#c41e3a"],
  "1-pants": ["#1a1a1e", "#1e3a5f", "#3b82f6", "#9a9a9a", "#6d4c2f"],
  "1-shorts": ["#ff8fab", "#1a1a1e", "#f4f4f6", "#1e3a8a", "#9a9a9a"],
  "1-jeans": ["#3b82f6", "#1a1a1e", "#6b7280", "#93c5fd", "#1e3a5f"],
  "1-pleat": ["#1a1a1e", "#ff8fab", "#f4f4f6", "#1e3a8a", "#c41e3a"],
};
const SHOE_PAL: Record<string, string[]> = {
  "0-sneakers": ["#c41e3a", "#f4f4f6", "#1a1a1e", "#3b82f6", "#9a9a9a"],
  "0-hightops": ["#1a1a1e", "#c41e3a", "#f4f4f6", "#7c3aed", "#6b7280"],
  "0-boots": ["#1a1a1e", "#6d4c2f", "#c41e3a", "#6b7280", "#f4f4f6"],
  "0-skate": ["#1a1a1e", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "0-slides": ["#1a1a1e", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "1-sneakers": ["#c41e3a", "#f4f4f6", "#1a1a1e", "#ff8fab", "#3b82f6"],
  "1-hightops": ["#1a1a1e", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-boots": ["#1a1a1e", "#6d4c2f", "#c41e3a", "#ff8fab", "#f4f4f6"],
  "1-skate": ["#1a1a1e", "#f4f4f6", "#ff8fab", "#3b82f6", "#c41e3a"],
  "1-flats": ["#ff8fab", "#c41e3a", "#f4f4f6", "#1a1a1e", "#7c3aed"],
};

export const TOPS = TOP_PAL["0-hoodie"];
export const BOTTOMS = BOT_PAL["0-pants"];
export const SHOES = SHOE_PAL["0-sneakers"];

export function hairsFor(gender: number) {
  return gender === 1 ? HAIR_GIRL : HAIR_BOY;
}
export function topsFor(gender: number) {
  return gender === 1 ? TOP_GIRL : TOP_BOY;
}
export function botsFor(gender: number) {
  return gender === 1 ? BOT_GIRL : BOT_BOY;
}
export function shoesFor(gender: number) {
  return gender === 1 ? SHOE_GIRL : SHOE_BOY;
}
export function facesFor(_gender: number) {
  return ["oval"];
}
export function defaultHairName(gender: number) {
  return gender === 1 ? "pony" : "messy";
}

export function hairColors(gender: number) {
  return gender === 1 ? HAIR_GIRL_C : HAIR_BOY_C;
}
export function topColors(gender: number, cut: number) {
  const name = topsFor(gender)[cut] || "hoodie";
  return TOP_PAL[`${gender}-${name}`] || TOP_PAL["0-hoodie"];
}
export function botColors(gender: number, cut: number) {
  const name = botsFor(gender)[cut] || (gender === 1 ? "skirt" : "pants");
  return BOT_PAL[`${gender}-${name}`] || BOT_PAL["0-pants"];
}
export function shoeColors(gender: number, cut: number) {
  const name = shoesFor(gender)[cut] || "sneakers";
  return SHOE_PAL[`${gender}-${name}`] || SHOE_PAL["0-sneakers"];
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
  shoeCut: 0,
  eyes: 0,
  face: 0,
};

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  const gender = n(f?.gender, GENDERS.length - 1);
  return {
    gender,
    skin: n(f?.skin, SKIN_N - 1),
    hair: n(f?.hair, hairsFor(gender).length - 1),
    hairColor: n(f?.hairColor, HAIR_COLOR_N - 1),
    top: n(f?.top, COLOR_N - 1),
    bottom: n(f?.bottom, COLOR_N - 1),
    shoes: n(f?.shoes, COLOR_N - 1),
    acc: 0,
    topCut: n(f?.topCut, topsFor(gender).length - 1),
    botCut: n(f?.botCut, botsFor(gender).length - 1),
    shoeCut: n(f?.shoeCut, shoesFor(gender).length - 1),
    eyes: 0,
    face: 0,
  };
}

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean };

function palOf(f: Figure) {
  return {
    skin: SKIN[f.skin] || SKIN[2],
    hair: hairColors(f.gender ?? 0)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(f.gender ?? 0, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(f.gender ?? 0, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(f.gender ?? 0, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

const BOT_Y = 128;
const HAIR_BODY_Y = 82;
const SHOE_TOP: Record<string, number> = {
  sneakers: 156,
  hightops: 150,
  boots: 146,
  skate: 152,
  slides: 158,
  flats: 158,
};

const CHIBI = new Map<string, Pix>();

export function setChibi(id: string, pix: Pix) {
  CHIBI.set(id, pix);
}

export function hasChibi(id: string) {
  return CHIBI.has(id);
}

export function chibiIds(fig: Figure) {
  const f = clampFigure(fig);
  const g = f.gender === 1 ? "f" : "m";
  return [
    `${g}-hair-${hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0)}`,
    `${g}-top-${topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie"}`,
    `${g}-bot-${botsFor(f.gender ?? 0)[f.botCut ?? 0] || (f.gender === 1 ? "skirt" : "pants")}`,
    `${g}-shoe-${shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers"}`,
  ];
}

export function allChibiIds() {
  const ids: string[] = [];
  for (const gender of [0, 1]) {
    const g = gender === 1 ? "f" : "m";
    for (const name of hairsFor(gender)) ids.push(`${g}-hair-${name}`);
    for (const name of topsFor(gender)) ids.push(`${g}-top-${name}`);
    for (const name of botsFor(gender)) ids.push(`${g}-bot-${name}`);
    for (const name of shoesFor(gender)) ids.push(`${g}-shoe-${name}`);
  }
  return ids;
}

export function pixFromRgba(w: number, h: number, data: ArrayLike<number>) {
  const p = new Pix(LOOK_W, LOOK_H);
  const cw = Math.min(w, LOOK_W);
  const ch = Math.min(h, LOOK_H);
  const src = data;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * w + x) * 4;
      const a = src[i + 3];
      if (a < 8) continue;
      p.set(x, y, [src[i], src[i + 1], src[i + 2]], a);
    }
  }
  return p;
}

function isOutline(r: number, g: number, b: number) {
  return r + g + b < 70;
}

function isSkinPx(r: number, g: number, b: number) {
  if (r < 90) return false;
  const rg = r - g;
  const rb = r - b;
  if (rg < -10 || rg > 100) return false;
  if (rb < 10 || rb > 145) return false;
  if (g < 40 || b < 20) return false;
  if (b > g + 8 && r > 200) return false;
  return true;
}

function isWhite(r: number, g: number, b: number) {
  return r > 228 && g > 228 && b > 220;
}

function isGreyClothes(r: number, g: number, b: number) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx - mn < 26 && mx > 70 && mx < 215;
}

function canHair(r: number, g: number, b: number, x: number, y: number, w: number) {
  if (isSkinPx(r, g, b)) return false;
  if (isWhite(r, g, b)) return false;
  if (isGreyClothes(r, g, b)) return false;
  if (r > 210 && g > 180 && b < 120) return false;
  if (y > HAIR_BODY_Y) {
    if (x > 30 && x < w - 30) return false;
    const brown = r > g - 5 && g >= b - 15 && r - b > 15 && g < 160 && r < 200;
    const dark = r + g + b < 90;
    if (!brown && !dark) return false;
  } else if (y > 70) {
    if (r > 180 && g < 180 && b > 110) return false;
  }
  return true;
}

function hairMask(src: Pix) {
  const m = new Uint8Array(src.w * src.h);
  const ok = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= src.w || y >= src.h) return false;
    if (src.a(x, y) < 16) return false;
    const i = (y * src.w + x) * 4;
    return canHair(src.d[i], src.d[i + 1], src.d[i + 2], x, y, src.w);
  };
  const stack: number[] = [];
  for (let y = 0; y <= 50; y++) {
    for (let x = 0; x < src.w; x++) {
      if (!ok(x, y)) continue;
      const i = y * src.w + x;
      m[i] = 1;
      stack.push(i);
    }
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % src.w;
    const y = (i / src.w) | 0;
    const nbs = [i - 1, i + 1, i - src.w, i + src.w];
    for (const n of nbs) {
      if (n < 0 || n >= m.length || m[n]) continue;
      const nx = n % src.w;
      const ny = (n / src.w) | 0;
      if (!ok(nx, ny)) continue;
      m[n] = 1;
      stack.push(n);
    }
  }
  return m;
}

function clearBand(p: Pix, y0: number, y1: number) {
  const yA = Math.max(0, y0);
  const yB = Math.min(p.h, y1);
  for (let y = yA; y < yB; y++) {
    for (let x = 0; x < p.w; x++) p.set(x, y, [0, 0, 0], 0);
  }
}

function stampBand(dst: Pix, src: Pix, y0: number, y1: number) {
  const yA = Math.max(0, y0);
  const yB = Math.min(dst.h, src.h, y1);
  for (let y = yA; y < yB; y++) {
    for (let x = 0; x < dst.w; x++) {
      if (src.a(x, y) < 16) continue;
      const i = (y * src.w + x) * 4;
      dst.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
}

function stampHair(dst: Pix, src: Pix, mask: Uint8Array) {
  for (let y = 0; y < dst.h; y++) {
    for (let x = 0; x < dst.w; x++) {
      if (!mask[y * src.w + x]) continue;
      if (src.a(x, y) < 16) continue;
      const i = (y * src.w + x) * 4;
      dst.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
}

function tintPixels(
  p: Pix,
  hex: string,
  keep: (x: number, y: number, r: number, g: number, b: number) => boolean,
  refLum?: number
) {
  const t = rgb(hex);
  const tl = refLum != null ? refLum : t[0] * 0.32 + t[1] * 0.5 + t[2] * 0.18;
  const den = tl || 1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      const i = (y * p.w + x) * 4;
      const r = p.d[i],
        g = p.d[i + 1],
        b = p.d[i + 2];
      if (isOutline(r, g, b) || isWhite(r, g, b)) continue;
      if (!keep(x, y, r, g, b)) continue;
      const lum = r * 0.32 + g * 0.5 + b * 0.18;
      const s = lum / den;
      p.set(x, y, [
        Math.max(0, Math.min(255, Math.round(t[0] * s))),
        Math.max(0, Math.min(255, Math.round(t[1] * s))),
        Math.max(0, Math.min(255, Math.round(t[2] * s))),
      ]);
    }
  }
}

function skinMask(p: Pix) {
  const m = new Uint8Array(p.w * p.h);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      const i = (y * p.w + x) * 4;
      if (isSkinPx(p.d[i], p.d[i + 1], p.d[i + 2])) m[y * p.w + x] = 1;
    }
  }
  return m;
}

function paintChibi(f: Figure): Pix {
  const ids = chibiIds(f);
  const hair = CHIBI.get(ids[0])!;
  const top = CHIBI.get(ids[1])!;
  const bot = CHIBI.get(ids[2])!;
  const shoe = CHIBI.get(ids[3])!;
  const g = f.gender ?? 0;
  const shoeName = shoesFor(g)[f.shoeCut ?? 0] || "sneakers";
  const shoeTop = SHOE_TOP[shoeName] ?? 156;
  const p = new Pix(LOOK_W, LOOK_H);
  p.blit(top);
  clearBand(p, BOT_Y, LOOK_H);
  stampBand(p, bot, BOT_Y, LOOK_H);
  stampBand(p, shoe, shoeTop, LOOK_H);
  const mask = hairMask(hair);
  stampHair(p, hair, mask);
  const skins = skinMask(p);
  const pal = palOf(f);
  tintPixels(p, pal.skin, (x, y) => !!skins[y * p.w + x], 200);
  tintPixels(p, pal.hair, (x, y) => !!mask[y * hair.w + x] && !skins[y * p.w + x]);
  tintPixels(
    p,
    pal.top,
    (x, y) => y >= 82 && y < BOT_Y && !skins[y * p.w + x] && !mask[y * hair.w + x]
  );
  tintPixels(p, pal.bot, (x, y) => y >= BOT_Y && y < shoeTop && !skins[y * p.w + x]);
  tintPixels(p, pal.shoe, (x, y) => y >= shoeTop && !skins[y * p.w + x]);
  return p;
}

export function paintLook(fig: Figure, _opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  if (chibiIds(f).every(hasChibi)) return paintChibi(f);
  return new Pix(LOOK_W, LOOK_H);
}

export function lookKey(fig: Figure, opts: LookOpts = {}) {
  const f = clampFigure(fig);
  return [
    f.gender,
    f.skin,
    f.hair,
    f.hairColor,
    f.top,
    f.topCut,
    f.bottom,
    f.botCut,
    f.shoes,
    f.shoeCut,
    opts.back ? 1 : 0,
    opts.walk ?? 0,
    opts.sit ? 1 : 0,
  ].join(".");
}
