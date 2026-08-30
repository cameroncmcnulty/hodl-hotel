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
  "1-tee": ["#f4f4f6", "#ff8fab", "#e8b931", "#c41e3a", "#1a1a1e"],
  "1-jacket": ["#1a1a1e", "#ff8fab", "#7c3aed", "#f4f4f6", "#c41e3a"],
  "1-tank": ["#1a1a1e", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-sweater": ["#f3e0c8", "#ff8fab", "#c4b5fd", "#9a9a9a", "#c41e3a"],
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

const INK: [number, number, number] = [0, 0, 0];

function isInk(r: number, g: number, b: number) {
  return r + g + b < 40;
}

function isSclera(r: number, g: number, b: number) {
  return r > 215 && g > 210 && b > 200 && Math.abs(r - g) < 28;
}

function isSkinPx(r: number, g: number, b: number) {
  if (isInk(r, g, b) || isSclera(r, g, b)) return false;
  if (r < 90) return false;
  if (r + g + b < 290) return false;
  const rg = r - g;
  const rb = r - b;
  if (rg < 4 || rg > 105) return false;
  if (rb < 24 || rb > 160) return false;
  if (b > g + 12) return false;
  return true;
}

function isPupil(r: number, g: number, b: number, x: number, y: number) {
  if (y < 56 || y > 76 || x < 32 || x > 68) return false;
  return r + g + b < 80 && r < 50 && g < 50;
}

function isSide(x: number, w: number) {
  return x < 22 || x > w - 22;
}

function isHairPx(r: number, g: number, b: number, x: number, y: number, w: number) {
  if (isSkinPx(r, g, b) || isSclera(r, g, b)) return false;
  if (isPupil(r, g, b, x, y)) return false;
  const brown = r > g - 5 && g >= b - 15 && r - b > 12 && r > 40 && r < 220 && g < 180;
  const dark = r + g + b < 110;
  if (y <= 70) return brown || dark;
  if (isSide(x, w) && y <= 132 && brown) return true;
  return false;
}

function isHandZone(x: number, y: number, w: number) {
  return y >= 118 && y <= 146 && (x < 20 || x > w - 20);
}

function inFace(x: number, y: number) {
  return y >= 48 && y <= 86 && x >= 28 && x <= 68;
}

function outsideMask(p: Pix): Uint8Array {
  const w = p.w;
  const h = p.h;
  const out = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (out[i]) return;
    if (p.a(x, y) >= 16) return;
    out[i] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  return out;
}

function touchesOutside(outside: Uint8Array, w: number, h: number, x: number, y: number) {
  return (
    (x > 0 && outside[y * w + x - 1]) ||
    (x < w - 1 && outside[y * w + x + 1]) ||
    (y > 0 && outside[(y - 1) * w + x]) ||
    (y < h - 1 && outside[(y + 1) * w + x])
  );
}

function eraseClothes(p: Pix) {
  for (let y = 78; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      const i = (y * p.w + x) * 4;
      const r = p.d[i],
        g = p.d[i + 1],
        b = p.d[i + 2];
      if (inFace(x, y) && (isPupil(r, g, b, x, y) || isSclera(r, g, b) || isSkinPx(r, g, b))) continue;
      if (isHairPx(r, g, b, x, y, p.w)) continue;
      p.set(x, y, [0, 0, 0], 0);
    }
  }
}

function stampOver(dst: Pix, src: Pix, y0: number, y1: number, skipHands = false) {
  const yA = Math.max(0, y0);
  const yB = Math.min(dst.h, src.h, y1);
  for (let y = yA; y < yB; y++) {
    for (let x = 0; x < dst.w; x++) {
      if (src.a(x, y) < 16) continue;
      if (skipHands && isHandZone(x, y, dst.w) && dst.a(x, y) >= 16) continue;
      if (dst.a(x, y) >= 16) {
        const di = (y * dst.w + x) * 4;
        const dr = dst.d[di],
          dg = dst.d[di + 1],
          db = dst.d[di + 2];
        if (inFace(x, y) && (isPupil(dr, dg, db, x, y) || isSclera(dr, dg, db) || isSkinPx(dr, dg, db))) continue;
        if (isHairPx(dr, dg, db, x, y, dst.w)) continue;
      }
      const i = (y * src.w + x) * 4;
      dst.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
}

function restoreHands(dst: Pix, src: Pix) {
  for (let y = 110; y < 152; y++) {
    for (let x = 0; x < dst.w; x++) {
      if (!isHandZone(x, y, dst.w)) continue;
      if (src.a(x, y) < 16) continue;
      const i = (y * src.w + x) * 4;
      dst.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
}

function clearBand(p: Pix, y0: number, y1: number) {
  const yA = Math.max(0, y0);
  const yB = Math.min(p.h, y1);
  for (let y = yA; y < yB; y++) {
    for (let x = 0; x < p.w; x++) {
      if (isHandZone(x, y, p.w) && p.a(x, y) >= 16) continue;
      p.set(x, y, [0, 0, 0], 0);
    }
  }
}

function closeHoles(p: Pix) {
  const fill: number[] = [];
  for (let y = 1; y < p.h - 1; y++) {
    for (let x = 1; x < p.w - 1; x++) {
      if (p.a(x, y) >= 16) continue;
      let n = 0,
        r = 0,
        g = 0,
        b = 0;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ] as const) {
        if (p.a(nx, ny) < 16) continue;
        const i = (ny * p.w + nx) * 4;
        n++;
        r += p.d[i];
        g += p.d[i + 1];
        b += p.d[i + 2];
      }
      if (n < 3) continue;
      fill.push(x, y, Math.round(r / n), Math.round(g / n), Math.round(b / n));
    }
  }
  for (let k = 0; k < fill.length; k += 5) {
    p.set(fill[k], fill[k + 1], [fill[k + 2], fill[k + 3], fill[k + 4]], 255);
  }
}

function fillTorsoHoles(p: Pix) {
  for (let pass = 0; pass < 12; pass++) {
    const fill: number[] = [];
    for (let y = 90; y < BOT_Y; y++) {
      for (let x = 32; x < p.w - 32; x++) {
        if (p.a(x, y) >= 16) continue;
        if (inFace(x, y)) continue;
        let r = 0,
          g = 0,
          b = 0,
          c = 0;
        for (const [nx, ny] of [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ] as const) {
          if (p.a(nx, ny) < 16) continue;
          const i = (ny * p.w + nx) * 4;
          r += p.d[i];
          g += p.d[i + 1];
          b += p.d[i + 2];
          c++;
        }
        if (!c) continue;
        fill.push(x, y, Math.round(r / c), Math.round(g / c), Math.round(b / c));
      }
    }
    if (!fill.length) break;
    for (let k = 0; k < fill.length; k += 5) {
      p.set(fill[k], fill[k + 1], [fill[k + 2], fill[k + 3], fill[k + 4]], 255);
    }
  }
}

function dropSpecks(p: Pix) {
  const drop: number[] = [];
  for (let y = 1; y < p.h - 1; y++) {
    for (let x = 1; x < p.w - 1; x++) {
      if (p.a(x, y) < 16) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (p.a(x + dx, y + dy) >= 16) n++;
        }
      }
      if (n <= 1) drop.push(x, y);
    }
  }
  for (let k = 0; k < drop.length; k += 2) p.set(drop[k], drop[k + 1], [0, 0, 0], 0);
}

function sealOutline(p: Pix, outside: Uint8Array) {
  const ring: number[] = [];
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      if (touchesOutside(outside, p.w, p.h, x, y)) ring.push(x, y);
    }
  }
  for (let k = 0; k < ring.length; k += 2) p.set(ring[k], ring[k + 1], INK, 255);
}

function growMask(p: Pix, mask: Uint8Array, allow: (r: number, g: number, b: number, x: number, y: number) => boolean) {
  const w = p.w;
  const h = p.h;
  for (let pass = 0; pass < 10; pass++) {
    const add: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (mask[idx] || p.a(x, y) < 16) continue;
        const i = idx * 4;
        const r = p.d[i],
          g = p.d[i + 1],
          b = p.d[i + 2];
        if (isInk(r, g, b)) continue;
        if (!allow(r, g, b, x, y)) continue;
        if (
          (x > 0 && mask[idx - 1]) ||
          (x < w - 1 && mask[idx + 1]) ||
          (y > 0 && mask[idx - w]) ||
          (y < h - 1 && mask[idx + w])
        ) {
          add.push(idx);
        }
      }
    }
    if (!add.length) break;
    for (const idx of add) mask[idx] = 1;
  }
}

function tintPixels(
  p: Pix,
  hex: string,
  keep: (x: number, y: number) => boolean,
  contrast = 0.22,
  outside?: Uint8Array,
) {
  const t = rgb(hex);
  const hits: number[] = [];
  let minL = 255;
  let maxL = 0;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      if (!keep(x, y)) continue;
      const i = (y * p.w + x) * 4;
      const r = p.d[i],
        g = p.d[i + 1],
        b = p.d[i + 2];
      const lum = r * 0.32 + g * 0.5 + b * 0.18;
      if (lum < minL) minL = lum;
      if (lum > maxL) maxL = lum;
      hits.push(x, y, lum);
    }
  }
  if (hits.length < 8) return;
  const span = maxL - minL;
  const lo = 0.84;
  const hi = Math.min(1, lo + Math.min(contrast, 0.14));
  for (let h = 0; h < hits.length; h += 3) {
    const u = span < 8 ? 0.6 : (hits[h + 2] - minL) / span;
    const s = lo + (hi - lo) * u;
    p.set(hits[h], hits[h + 1], [
      Math.max(0, Math.min(255, Math.round(t[0] * s))),
      Math.max(0, Math.min(255, Math.round(t[1] * s))),
      Math.max(0, Math.min(255, Math.round(t[2] * s))),
    ]);
  }
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
  p.blit(hair);
  eraseClothes(p);
  stampOver(p, top, 78, BOT_Y + 4);
  clearBand(p, BOT_Y, LOOK_H);
  stampOver(p, bot, BOT_Y - 2, LOOK_H, true);
  stampOver(p, shoe, shoeTop, LOOK_H, true);
  restoreHands(p, top);
  closeHoles(p);
  closeHoles(p);
  fillTorsoHoles(p);
  dropSpecks(p);
  const outside = outsideMask(p);
  const skinM = new Uint8Array(p.w * p.h);
  const hairM = new Uint8Array(p.w * p.h);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 16) continue;
      const i = (y * p.w + x) * 4;
      const r = p.d[i],
        g = p.d[i + 1],
        b = p.d[i + 2];
      const idx = y * p.w + x;
      if (isInk(r, g, b) && touchesOutside(outside, p.w, p.h, x, y)) continue;
      if (isSkinPx(r, g, b) && (inFace(x, y) || isHandZone(x, y, p.w) || (y >= 130 && y < 158))) skinM[idx] = 1;
      else if (isHairPx(r, g, b, x, y, p.w)) hairM[idx] = 1;
    }
  }
  growMask(p, skinM, (r, g, b, x, y) => {
    if (hairM[y * p.w + x]) return false;
    if (isPupil(r, g, b, x, y) || isSclera(r, g, b)) return false;
    if (!(inFace(x, y) || isHandZone(x, y, p.w) || (y >= 130 && y < 158))) return false;
    return isSkinPx(r, g, b);
  });
  growMask(p, hairM, (r, g, b, x, y) => {
    if (skinM[y * p.w + x]) return false;
    return isHairPx(r, g, b, x, y, p.w);
  });
  const pal = palOf(f);
  if (f.skin !== 1) tintPixels(p, pal.skin, (x, y) => !!skinM[y * p.w + x], 0.16, outside);
  if (f.hairColor !== 0) tintPixels(p, pal.hair, (x, y) => !!hairM[y * p.w + x], 0.24, outside);
  tintPixels(
    p,
    pal.top,
    (x, y) => {
      if (y < 74 || y >= BOT_Y + 2 || p.a(x, y) < 16) return false;
      const idx = y * p.w + x;
      if (skinM[idx] || hairM[idx]) return false;
      const i = idx * 4;
      if (isPupil(p.d[i], p.d[i + 1], p.d[i + 2], x, y)) return false;
      if (isSclera(p.d[i], p.d[i + 1], p.d[i + 2])) return false;
      return true;
    },
    0.2,
    outside,
  );
  tintPixels(
    p,
    pal.bot,
    (x, y) => {
      if (y < BOT_Y - 2 || y >= shoeTop || p.a(x, y) < 16) return false;
      if (isHandZone(x, y, p.w)) return false;
      if (skinM[y * p.w + x] || hairM[y * p.w + x]) return false;
      const i = (y * p.w + x) * 4;
      if (y > 142 && p.d[i] > 200 && p.d[i + 1] > 200 && p.d[i + 2] > 200) return false;
      return true;
    },
    0.2,
    outside,
  );
  tintPixels(
    p,
    pal.shoe,
    (x, y) => {
      if (y < shoeTop || p.a(x, y) < 16) return false;
      if (skinM[y * p.w + x]) return false;
      return true;
    },
    0.2,
    outside,
  );
  closeHoles(p);
  sealOutline(p, outsideMask(p));
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
