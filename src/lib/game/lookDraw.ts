import type { Figure } from "../types";
import { hexMix, mix, Pix, rgb } from "./pix";

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
  "0-hoodie": ["#8a8f98", "#1e3a8a", "#2a2a32", "#c41e3a", "#166534"],
  "0-tee": ["#e8b931", "#c41e3a", "#f4f4f6", "#3b82f6", "#2a2a32"],
  "0-jacket": ["#3a3a44", "#6d4c2f", "#c41e3a", "#1e3a5f", "#6b7280"],
  "0-tank": ["#2a2a32", "#f4f4f6", "#c41e3a", "#6b7280", "#1e3a8a"],
  "0-sweater": ["#c4a574", "#1e3a5f", "#7f1d1d", "#6b7280", "#166534"],
  "1-hoodie": ["#ff8fab", "#7c3aed", "#f4f4f6", "#8a8f98", "#3b82f6"],
  "1-tee": ["#f4f4f6", "#ff8fab", "#e8b931", "#c41e3a", "#2a2a32"],
  "1-jacket": ["#3a3a44", "#ff8fab", "#7c3aed", "#f4f4f6", "#c41e3a"],
  "1-tank": ["#2a2a32", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-sweater": ["#f3e0c8", "#ff8fab", "#c4b5fd", "#8a8f98", "#c41e3a"],
};
const BOT_PAL: Record<string, string[]> = {
  "0-pants": ["#2a2a32", "#1e3a5f", "#6d4c2f", "#8a8f98", "#c4a574"],
  "0-shorts": ["#8a8f98", "#1e3a5f", "#2a2a32", "#c41e3a", "#166534"],
  "0-jeans": ["#2563eb", "#1e3a5f", "#2a2a32", "#6b7280", "#93c5fd"],
  "0-cargo": ["#c4a574", "#3f4f2f", "#2a2a32", "#6d4c2f", "#8a8f98"],
  "0-joggers": ["#2a2a32", "#6b7280", "#1e3a5f", "#c41e3a", "#3f4f2f"],
  "1-skirt": ["#1e3a8a", "#ff8fab", "#2a2a32", "#8a8f98", "#c41e3a"],
  "1-pants": ["#2a2a32", "#1e3a5f", "#3b82f6", "#8a8f98", "#6d4c2f"],
  "1-shorts": ["#ff8fab", "#2a2a32", "#f4f4f6", "#1e3a8a", "#8a8f98"],
  "1-jeans": ["#3b82f6", "#2a2a32", "#6b7280", "#93c5fd", "#1e3a5f"],
  "1-pleat": ["#2a2a32", "#ff8fab", "#f4f4f6", "#1e3a8a", "#c41e3a"],
};
const SHOE_PAL: Record<string, string[]> = {
  "0-sneakers": ["#c41e3a", "#f4f4f6", "#2a2a32", "#3b82f6", "#8a8f98"],
  "0-hightops": ["#2a2a32", "#c41e3a", "#f4f4f6", "#7c3aed", "#6b7280"],
  "0-boots": ["#2a2a32", "#6d4c2f", "#c41e3a", "#6b7280", "#f4f4f6"],
  "0-skate": ["#2a2a32", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "0-slides": ["#2a2a32", "#f4f4f6", "#c41e3a", "#3b82f6", "#6b7280"],
  "1-sneakers": ["#c41e3a", "#f4f4f6", "#2a2a32", "#ff8fab", "#3b82f6"],
  "1-hightops": ["#2a2a32", "#ff8fab", "#f4f4f6", "#7c3aed", "#c41e3a"],
  "1-boots": ["#2a2a32", "#6d4c2f", "#c41e3a", "#ff8fab", "#f4f4f6"],
  "1-skate": ["#2a2a32", "#f4f4f6", "#ff8fab", "#3b82f6", "#c41e3a"],
  "1-flats": ["#ff8fab", "#c41e3a", "#f4f4f6", "#2a2a32", "#7c3aed"],
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

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean; view?: 0 | 1 | 2 | 3 };

type RGB = [number, number, number];
const INK: RGB = [18, 14, 16];
const WHITE: RGB = [248, 248, 252];
const CX = 48;

function palOf(f: Figure) {
  return {
    skin: SKIN[f.skin] || SKIN[1],
    hair: hairColors(f.gender ?? 0)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(f.gender ?? 0, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(f.gender ?? 0, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(f.gender ?? 0, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

function tone(hex: string, u: number): RGB {
  if (u < -0.28) return mix(hex, 38);
  if (u > 0.32) return mix(hex, -40);
  return rgb(hex);
}

function oval(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 1.02) continue;
      p.set(x, y, tone(hex, dx * 0.55 + dy * 0.65));
    }
  }
}

function box(p: Pix, x: number, y: number, w: number, h: number, hex: string, rad = 3) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const ww = Math.round(w);
  const hh = Math.round(h);
  const r = Math.max(0, Math.min(rad, Math.floor(ww / 2) - 1, Math.floor(hh / 2) - 1));
  for (let j = 0; j < hh; j++) {
    for (let i = 0; i < ww; i++) {
      if (r > 0) {
        const rr = r * r;
        if (i < r && j < r && (r - i) * (r - i) + (r - j) * (r - j) > rr) continue;
        if (i > ww - 1 - r && j < r && (i - (ww - 1 - r)) * (i - (ww - 1 - r)) + (r - j) * (r - j) > rr) continue;
        if (i < r && j > hh - 1 - r && (r - i) * (r - i) + (j - (hh - 1 - r)) * (j - (hh - 1 - r)) > rr) continue;
        if (i > ww - 1 - r && j > hh - 1 - r && (i - (ww - 1 - r)) * (i - (ww - 1 - r)) + (j - (hh - 1 - r)) * (j - (hh - 1 - r)) > rr)
          continue;
      }
      const u = (i / Math.max(1, ww)) * 0.9 + (j / Math.max(1, hh)) * 0.5 - 0.7;
      p.set(x0 + i, y0 + j, tone(hex, u));
    }
  }
}

function limb(p: Pix, x: number, y: number, w: number, h: number, hex: string) {
  const ww = Math.max(6, Math.round(w));
  const hh = Math.max(ww, Math.round(h));
  const r = ww / 2;
  oval(p, x + r, y + r, r, r * 0.9, hex);
  box(p, x, y + r - 1, ww, Math.max(1, hh - ww + 2), hex, 0);
  oval(p, x + r, y + hh - r, r, r * 0.9, hex);
}

function flipH(src: Pix) {
  const p = new Pix(src.w, src.h);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + (src.w - 1 - x)) * 4;
      if (src.d[i + 3] < 8) continue;
      p.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
  return p;
}

function sleeveOf(top: string): "none" | "short" | "long" {
  if (top === "tank") return "none";
  if (top === "tee") return "short";
  return "long";
}

function paintSkin(p: Pix, skin: string, walk: number, sit: boolean) {
  const a = walk ? 3 : 0;
  const b = walk ? -3 : 0;
  const lift = sit ? -8 : 0;
  limb(p, 34, 114 + a + lift, 12, 40, skin);
  limb(p, 50, 114 + b + lift, 12, 40, skin);
  box(p, 32, 74, 32, 44, skin, 6);
  limb(p, 22, 76, 12, 46, skin);
  limb(p, 62, 76, 12, 46, skin);
  oval(p, 28, 122, 5.5, 5, skin);
  oval(p, 68, 122, 5.5, 5, skin);
  box(p, 44, 66, 8, 10, skin, 3);
  oval(p, CX, 46, 21, 22, skin);
  oval(p, 28, 50, 3.4, 4.2, skin);
  oval(p, 68, 50, 3.4, 4.2, skin);
}

function paintFace(p: Pix, girl: boolean, back: boolean) {
  if (back) return;
  p.disc(40, 47, 4.2, 5.0, WHITE);
  p.disc(56, 47, 4.2, 5.0, WHITE);
  p.disc(40, 48, 2.2, 2.8, INK);
  p.disc(56, 48, 2.2, 2.8, INK);
  p.set(41, 46, WHITE);
  p.set(57, 46, WHITE);
  p.rect(45, 58, 6, 2, mix("#7a4450", 0));
  if (girl) {
    oval(p, 34, 54, 2.0, 1.4, "#e0909a");
    oval(p, 62, 54, 2.0, 1.4, "#e0909a");
  }
}

function paintHair(p: Pix, style: string, col: string, girl: boolean, back: boolean) {
  if (back) {
    oval(p, CX, 44, 22, 24, col);
    oval(p, 32, 42, 10, 14, col);
    oval(p, 64, 42, 10, 14, col);
    oval(p, CX, 26, 14, 12, col);
  }
  if (style === "afro") {
    oval(p, CX, 40, 26, 24, col);
    oval(p, 28, 42, 10, 12, col);
    oval(p, 68, 42, 10, 12, col);
    oval(p, CX, 22, 14, 10, col);
    return;
  }
  if (!girl && style === "mohawk") {
    box(p, 44, 16, 8, 28, col, 2);
    p.spike(CX, 12, 40, 5, col);
    return;
  }
  if (!girl && style === "spikes") {
    oval(p, CX, 36, 16, 12, col);
    p.spike(34, 18, 42, 4, col);
    p.spike(48, 14, 40, 5, col);
    p.spike(62, 18, 42, 4, col);
    return;
  }

  oval(p, CX, 34, 20, 16, col);
  oval(p, 32, 42, 9, 12, col);
  oval(p, 64, 42, 9, 12, col);
  oval(p, CX, 24, 14, 10, col);

  if (!girl && style === "side") {
    oval(p, 34, 36, 14, 14, col);
    oval(p, 62, 44, 8, 8, col);
  }
  if (!girl && style === "undercut") {
    box(p, 32, 48, 32, 3, hexMix(col, -40), 0);
  }
  if (girl && style === "bob") {
    oval(p, 30, 58, 9, 12, col);
    oval(p, 66, 58, 9, 12, col);
  }
  if (girl && style === "bun") oval(p, CX, 16, 9, 8, col);
  if (girl && style === "pony") {
    oval(p, 24, 36, 8, 10, col);
    limb(p, 18, 40, 10, 28, col);
    oval(p, 23, 70, 7, 7, col);
  }
  if (girl && style === "pigtails") {
    oval(p, 22, 40, 7, 8, col);
    oval(p, 74, 40, 7, 8, col);
    limb(p, 18, 44, 8, 16, col);
    limb(p, 70, 44, 8, 16, col);
    oval(p, 22, 62, 6, 6, col);
    oval(p, 74, 62, 6, 6, col);
  }
  if (girl && (style === "long" || style === "waves")) {
    limb(p, 20, 48, 10, 36, col);
    limb(p, 66, 48, 10, 36, col);
    if (style === "waves") {
      oval(p, 24, 70, 8, 9, col);
      oval(p, 72, 70, 8, 9, col);
    }
  }

  if (!back) {
    oval(p, 38, 34, 6, 5, col);
    oval(p, 48, 32, 6, 4, col);
    oval(p, 58, 34, 6, 5, col);
  }
}

function paintBot(p: Pix, name: string, col: string, girl: boolean, walk: number, sit: boolean) {
  const a = walk ? 3 : 0;
  const b = walk ? -3 : 0;
  const lift = sit ? -8 : 0;
  const skirt = girl && (name === "skirt" || name === "pleat");
  const short = name === "shorts";
  const h = sit ? 16 : short ? 22 : 38;

  if (skirt) {
    for (let y = 112; y <= 142; y++) {
      const t = (y - 112) / 30;
      const w = Math.round(14 + t * 12);
      box(p, CX - w, y + lift, w * 2, 1, col, 0);
    }
    box(p, 34, 112 + lift, 28, 6, hexMix(col, -16), 2);
    if (name === "pleat") {
      p.rect(40, 118 + lift, 1, 18, mix(col, -50));
      p.rect(48, 118 + lift, 1, 20, mix(col, -50));
      p.rect(56, 118 + lift, 1, 18, mix(col, -50));
    }
    return;
  }

  limb(p, 34, 112 + a + lift, 13, h, col);
  limb(p, 49, 112 + b + lift, 13, h, col);
  box(p, 34, 110 + lift, 28, 10, col, 3);
  if (name === "jeans") {
    p.rect(40, 120 + lift, 1, 24, mix(col, 44));
    p.rect(55, 120 + lift, 1, 24, mix(col, 44));
  }
  if (name === "cargo") {
    box(p, 30, 128 + lift, 8, 10, hexMix(col, -18), 2);
    box(p, 58, 128 + lift, 8, 10, hexMix(col, -18), 2);
  }
  if (name === "joggers") {
    box(p, 34, 144 + lift, 13, 6, hexMix(col, -22), 2);
    box(p, 49, 144 + lift, 13, 6, hexMix(col, -22), 2);
  }
}

function paintTop(p: Pix, name: string, col: string, skin: string, back: boolean) {
  const sleeve = sleeveOf(name);
  box(p, 30, 72, 36, 42, col, 6);
  oval(p, CX, 76, 14, 8, col);

  if (sleeve === "long") {
    limb(p, 20, 74, 14, 44, col);
    limb(p, 62, 74, 14, 44, col);
  } else if (sleeve === "short") {
    box(p, 20, 74, 14, 16, col, 5);
    box(p, 62, 74, 14, 16, col, 5);
  }

  if (name === "hoodie") {
    box(p, 38, 68, 20, 8, hexMix(col, -16), 4);
    oval(p, CX, 72, 6, 5, skin);
    box(p, 38, 90, 20, 14, hexMix(col, -22), 4);
    p.rect(42, 76, 2, 12, WHITE);
    p.rect(52, 76, 2, 12, WHITE);
    if (back) oval(p, CX, 64, 14, 10, hexMix(col, -16));
  } else if (name === "sweater") {
    box(p, 38, 68, 20, 8, hexMix(col, -20), 3);
  } else if (name === "jacket") {
    box(p, 45, 74, 6, 38, "#e8e2d6", 1);
    p.rect(47, 76, 1, 34, INK);
  } else if (name === "tank") {
    box(p, 36, 72, 5, 8, hexMix(col, -18), 1);
    box(p, 55, 72, 5, 8, hexMix(col, -18), 1);
  } else {
    oval(p, CX, 74, 7, 4, hexMix(col, -14));
  }
}

function paintShoes(p: Pix, name: string, col: string, walk: number, sit: boolean) {
  const a = walk ? 3 : 0;
  const b = walk ? -3 : 0;
  const lift = sit ? -8 : 0;
  const hi = name === "boots" ? 140 : name === "hightops" ? 144 : 150;
  const yL = hi + a + lift;
  const yR = hi + b + lift;
  const h = 166 + lift - hi;
  box(p, 32, yL, 15, h, col, 4);
  box(p, 49, yR, 15, h, col, 4);
  if (name === "slides" || name === "flats") {
    oval(p, 40, 158 + a + lift, 8, 5, col);
    oval(p, 56, 158 + b + lift, 8, 5, col);
    return;
  }
  if (name !== "boots") {
    box(p, 32, 160 + a + lift, 15, 5, "#f0f0f2", 2);
    box(p, 49, 160 + b + lift, 15, 5, "#f0f0f2", 2);
  }
  p.rect(34, yL + 4, 8, 2, mix(col, 40));
  p.rect(51, yR + 4, 8, 2, mix(col, 40));
}

function paintPose(f: Figure, back: boolean, walk: number, sit: boolean) {
  const girl = (f.gender ?? 0) === 1;
  const pal = palOf(f);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  const p = new Pix(LOOK_W, LOOK_H);

  if (girl && (hairName === "pony" || hairName === "long" || hairName === "waves" || hairName === "pigtails")) {
    paintHair(p, hairName, pal.hair, girl, true);
  }
  paintSkin(p, pal.skin, walk, sit);
  paintBot(p, botName, pal.bot, girl, walk, sit);
  paintTop(p, topName, pal.top, pal.skin, back);
  oval(p, 28, 122, 5.5, 5, pal.skin);
  oval(p, 68, 122, 5.5, 5, pal.skin);
  paintShoes(p, shoeName, pal.shoe, walk, sit);
  paintHair(p, hairName, pal.hair, girl, back);
  oval(p, CX, 50, 16, 15, pal.skin);
  paintFace(p, girl, back);
  p.outline(INK);
  return p;
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
  const walk = opts.walk ?? 0;
  const sit = !!opts.sit;
  const back = view === 2 || view === 3;
  const posed = paintPose(f, back, walk, sit);
  if (view === 0 || view === 3) return flipH(posed);
  return posed;
}

export function lookKey(fig: Figure, opts: LookOpts = {}) {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
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
    view,
    opts.walk ?? 0,
    opts.sit ? 1 : 0,
  ].join(".");
}

export function setChibi(_id: string, _pix: Pix) {}
export function hasChibi(_id?: string) {
  return true;
}
export function chibiIds(_fig?: Figure) {
  return [] as string[];
}
export function allChibiIds() {
  return [] as string[];
}
export function pixFromRgba(w: number, h: number, data: ArrayLike<number>) {
  const p = new Pix(LOOK_W, LOOK_H);
  const cw = Math.min(w, LOOK_W);
  const ch = Math.min(h, LOOK_H);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 8) continue;
      p.set(x, y, [data[i], data[i + 1], data[i + 2]], data[i + 3]);
    }
  }
  return p;
}
