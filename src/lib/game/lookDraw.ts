/**
 * Habbo-style figure compositor.
 *
 * A look is a recipe, not an image:
 *   hd-{gender}-{skin}.hr-{style}-{color}.ch-{cut}-{color}.lg-{cut}-{color}.sh-{cut}-{color}
 *
 * Each frame: parse → look up the set → paint that slot on the locked rig →
 * palette-dye → blit in a fixed draw order. Swap `ch-0-0` for `ch-1-3` and
 * only the shirt layer changes.
 */
import type { Figure } from "../types";
import { hexMix, mix, Pix, rgb } from "./pix";

export const LOOK_W = 96;
export const LOOK_H = 176;
export const LOOK_SCALE = 1;
export const LOOK_N = 1;

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
  look: 0,
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
    look: n(f?.look, Math.max(0, LOOK_N - 1)),
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
const INK: RGB = [10, 8, 10];
const WHITE: RGB = [255, 255, 255];
const BASE = "#8c8c8c";
const CX = 48;

/** Locked rig. Every part uses these pivots so a new hoodie still hits the same armholes. */
const R = {
  headX: 48,
  headY: 48,
  headRx: 20,
  headRy: 21,
  neckX: 44,
  neckY: 66,
  neckW: 8,
  neckH: 6,
  torsoX: 35,
  torsoY: 70,
  torsoW: 26,
  torsoH: 32,
  armW: 10,
  armH: 34,
  armLX: 24,
  armLY: 74,
  armRX: 62,
  armRY: 72,
  handLX: 29,
  handLY: 112,
  handRX: 67,
  handRY: 110,
  legW: 12,
  legH: 50,
  legLX: 35,
  legLY: 100,
  legRX: 49,
  legRY: 98,
  shoeW: 15,
  shoeH: 10,
  shoeLX: 33,
  shoeLY: 144,
  shoeRX: 49,
  shoeRY: 142,
};

function onFace(x: number, y: number) {
  const dx = (x - CX) / 14;
  const dy = (y - 52) / 13;
  return dx * dx + dy * dy < 1;
}

const partCache = new Map<string, Pix>();

export function figureString(fig: Figure) {
  const f = clampFigure(fig);
  const g = f.gender ?? 0;
  return [
    `hd-${g}-${f.skin}`,
    `hr-${f.hair}-${f.hairColor}`,
    `ch-${f.topCut ?? 0}-${f.top}`,
    `lg-${f.botCut ?? 0}-${f.bottom}`,
    `sh-${f.shoeCut ?? 0}-${f.shoes}`,
  ].join(".");
}

function palOf(f: Figure) {
  const g = f.gender ?? 0;
  return {
    skin: SKIN[f.skin] || SKIN[1],
    hair: hairColors(g)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(g, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(g, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(g, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

function lum(r: number, g: number, b: number) {
  return r * 0.3 + g * 0.54 + b * 0.16;
}

function dye(src: Pix, hex: string) {
  const [tr, tg, tb] = rgb(hex);
  const out = new Pix(src.w, src.h);
  for (let i = 0; i < src.d.length; i += 4) {
    if (src.d[i + 3] < 8) continue;
    const r = src.d[i],
      g = src.d[i + 1],
      b = src.d[i + 2];
    const L = lum(r, g, b);
    if (L < 40) {
      out.d[i] = INK[0];
      out.d[i + 1] = INK[1];
      out.d[i + 2] = INK[2];
      out.d[i + 3] = 255;
      continue;
    }
    if (L > 235) {
      out.d[i] = 255;
      out.d[i + 1] = 255;
      out.d[i + 2] = 255;
      out.d[i + 3] = 255;
      continue;
    }
    const k = Math.max(0.22, Math.min(1.25, L / 155));
    out.d[i] = Math.max(0, Math.min(255, Math.round(tr * k)));
    out.d[i + 1] = Math.max(0, Math.min(255, Math.round(tg * k)));
    out.d[i + 2] = Math.max(0, Math.min(255, Math.round(tb * k)));
    out.d[i + 3] = 255;
  }
  return out;
}

function finish(p: Pix) {
  p.outline(INK);
  return p;
}

function blank() {
  return new Pix(LOOK_W, LOOK_H);
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

function pose(walk: number, sit: boolean) {
  const drop = sit ? 20 : 0;
  const a = sit ? 0 : walk ? 4 : 0;
  const b = sit ? 0 : walk ? -4 : 0;
  return { drop, a, b, sit };
}

/** bd — torso, neck, arms, legs. No head. Clothes cover this. */
function partBd(girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const tw = girl ? 26 : 28;
  const tx = CX - Math.floor(tw / 2);
  p.capsule(R.armLX, R.armLY + drop, R.armW, sit ? 28 : R.armH, BASE);
  p.capsule(R.armRX, R.armRY + drop, R.armW, sit ? 28 : R.armH, BASE);
  p.roundBlock(tx, R.torsoY + drop, tw, sit ? 30 : R.torsoH, 5, BASE);
  p.block(R.neckX, R.neckY + drop, R.neckW, R.neckH, BASE);
  if (sit) {
    p.roundBlock(R.legLX - 2, R.legLY + drop - 6, 18, 14, 4, BASE);
    p.roundBlock(R.legRX - 2, R.legRY + drop - 4, 18, 14, 4, BASE);
    p.capsule(R.legLX + 2, R.legLY + drop + 4, 11, 22, BASE);
    p.capsule(R.legRX + 2, R.legRY + drop + 6, 11, 22, BASE);
  } else {
    p.capsule(R.legLX, R.legLY + drop + a, R.legW, R.legH, BASE);
    p.capsule(R.legRX, R.legRY + drop + b, R.legW, R.legH, BASE);
  }
  return finish(p);
}

/** hd — skull + ears only. Drawn after clothes so the chin sits on the collar. */
function partHd(): Pix {
  const p = blank();
  p.discShade(R.headX, R.headY, R.headRx, R.headRy, BASE);
  p.discShade(29, 52, 3.4, 4.2, BASE);
  p.discShade(67, 50, 3.4, 4.2, BASE);
  return finish(p);
}

/** fc + ey — face features, never dyed. */
function partFc(girl: boolean): Pix {
  const p = blank();
  p.disc(40, 50, 4.2, 5, WHITE);
  p.disc(56, 49, 4.2, 5, WHITE);
  p.disc(40, 51, 2.1, 2.6, INK);
  p.disc(56, 50, 2.1, 2.6, INK);
  p.set(41, 49, WHITE);
  p.set(57, 48, WHITE);
  p.rect(45, 60, 7, 2, [92, 50, 54]);
  if (girl) {
    p.discShade(33, 58, 2.4, 1.6, "#e0909a");
    p.discShade(62, 57, 2.4, 1.6, "#e0909a");
  }
  return p;
}

/** hrb — hair behind the skull (tails). */
function partHrb(style: string): Pix {
  const p = blank();
  if (style === "pony") {
    p.discShade(24, 44, 7, 8, BASE);
    p.capsule(18, 46, 10, 28, BASE);
    p.discShade(23, 76, 7, 7, BASE);
  } else if (style === "pigtails") {
    p.discShade(20, 46, 6.5, 7, BASE);
    p.discShade(76, 44, 6.5, 7, BASE);
    p.capsule(16, 50, 8, 18, BASE);
    p.capsule(74, 48, 8, 18, BASE);
    p.discShade(20, 70, 6, 6, BASE);
    p.discShade(78, 68, 6, 6, BASE);
  } else if (style === "long" || style === "waves") {
    p.capsule(20, 52, 12, 44, BASE);
    p.capsule(64, 52, 12, 44, BASE);
    if (style === "waves") {
      p.discShade(24, 92, 8, 8, BASE);
      p.discShade(72, 92, 8, 8, BASE);
    } else {
      p.discShade(26, 96, 7, 7, BASE);
      p.discShade(70, 96, 7, 7, BASE);
    }
  }
  return finish(p);
}

/** hr — hair on the skull. Face pixels stay empty so bangs never cover the eyes. */
function partHr(style: string, back: boolean): Pix {
  const raw = blank();
  if (back) {
    raw.discShade(CX, 46, 20, 22, BASE);
    raw.discShade(30, 44, 9, 11, BASE);
    raw.discShade(66, 44, 9, 11, BASE);
    raw.discShade(CX, 30, 11, 9, BASE);
  }
  if (style === "afro") {
    raw.discShade(CX, 42, 24, 23, BASE);
    raw.discShade(26, 46, 10, 11, BASE);
    raw.discShade(70, 44, 10, 11, BASE);
    raw.discShade(CX, 24, 12, 10, BASE);
  } else if (style === "mohawk") {
    raw.block(44, 20, 8, 28, BASE);
    raw.spike(CX, 16, 44, 5, BASE);
  } else if (style === "spikes") {
    raw.discShade(CX, 38, 14, 10, BASE);
    raw.spike(34, 22, 46, 4, BASE);
    raw.spike(48, 18, 44, 5, BASE);
    raw.spike(62, 22, 46, 4, BASE);
  } else {
    raw.discShade(CX, 34, 18, 14, BASE);
    raw.discShade(30, 46, 9, 11, BASE);
    raw.discShade(66, 44, 9, 11, BASE);
    raw.discShade(CX, 26, 12, 8, BASE);
    if (style === "side") {
      raw.discShade(32, 38, 12, 12, BASE);
      raw.discShade(64, 48, 7, 7, BASE);
    }
    if (style === "undercut") raw.block(30, 50, 36, 3, hexMix(BASE, -40));
    if (style === "bob") {
      raw.discShade(28, 58, 9, 11, BASE);
      raw.discShade(68, 56, 9, 11, BASE);
    }
    if (style === "bun") raw.discShade(CX, 20, 8, 7, BASE);
    if (style === "messy") {
      raw.discShade(38, 24, 6, 5, BASE);
      raw.discShade(54, 22, 6, 5, BASE);
      raw.discShade(46, 20, 5, 4, BASE);
    }
  }
  if (!back) {
    const p = blank();
    for (let y = 0; y < raw.h; y++) {
      for (let x = 0; x < raw.w; x++) {
        if (raw.a(x, y) < 8) continue;
        if (onFace(x, y)) continue;
        const i = (y * raw.w + x) * 4;
        p.set(x, y, [raw.d[i], raw.d[i + 1], raw.d[i + 2]], raw.d[i + 3]);
      }
    }
    return finish(p);
  }
  return finish(raw);
}

/** lg — trousers / skirt. Same leg pivots as bd. */
function partLg(name: string, girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const skirt = girl && (name === "skirt" || name === "pleat");
  const short = name === "shorts";
  const h = sit ? 18 : short ? 24 : 46;
  if (skirt) {
    const y0 = R.legLY + drop - 4;
    for (let y = y0; y <= y0 + 28; y++) {
      const t = (y - y0) / 28;
      const w = Math.round(12 + t * 12);
      p.block(CX - w, y, w * 2, 1, BASE);
    }
    p.roundBlock(CX - 14, y0, 28, 6, 2, hexMix(BASE, -18));
    if (name === "pleat") {
      p.rect(40, y0 + 8, 1, 16, mix(BASE, -50));
      p.rect(48, y0 + 8, 1, 18, mix(BASE, -50));
      p.rect(56, y0 + 8, 1, 16, mix(BASE, -50));
    }
    return finish(p);
  }
  if (sit) {
    p.roundBlock(R.legLX - 2, R.legLY + drop - 8, 18, 16, 4, BASE);
    p.roundBlock(R.legRX - 2, R.legRY + drop - 6, 18, 16, 4, BASE);
    p.capsule(R.legLX + 1, R.legLY + drop + 4, 12, 18, BASE);
    p.capsule(R.legRX + 1, R.legRY + drop + 6, 12, 18, BASE);
    return finish(p);
  }
  p.capsule(R.legLX - 1, R.legLY + drop + a, R.legW + 2, h, BASE);
  p.capsule(R.legRX - 1, R.legRY + drop + b, R.legW + 2, h, BASE);
  p.roundBlock(R.legLX - 1, R.legLY + drop - 4, 30, 12, 3, BASE);
  if (name === "jeans") {
    p.rect(40, R.legLY + drop + 8, 1, 22, mix(BASE, 50));
    p.rect(56, R.legLY + drop + 6, 1, 22, mix(BASE, 50));
  }
  if (name === "cargo") {
    p.roundBlock(R.legLX - 4, R.legLY + drop + 16, 8, 10, 2, hexMix(BASE, -16));
    p.roundBlock(R.legRX + 8, R.legRY + drop + 16, 8, 10, 2, hexMix(BASE, -16));
  }
  if (name === "joggers") {
    p.roundBlock(R.legLX - 1, R.legLY + drop + h - 8, R.legW + 2, 7, 2, hexMix(BASE, -20));
    p.roundBlock(R.legRX - 1, R.legRY + drop + h - 8, R.legW + 2, 7, 2, hexMix(BASE, -20));
  }
  return finish(p);
}

/** ch — chest + sleeves. Sleeves share the arm pivots so every shirt fits the same holes. */
function partCh(name: string, back: boolean, sit: boolean): Pix {
  const p = blank();
  const drop = sit ? 20 : 0;
  const sleeveH = sit ? 22 : name === "tee" ? 16 : 32;
  p.roundBlock(R.torsoX, R.torsoY + drop, R.torsoW, sit ? 28 : R.torsoH + 2, 5, BASE);
  p.discShade(CX, R.torsoY + drop + 4, 11, 5, BASE);
  if (name !== "tank") {
    p.capsule(R.armLX, R.armLY + drop, R.armW, sleeveH, BASE);
    p.capsule(R.armRX, R.armRY + drop, R.armW, sleeveH, BASE);
  }
  if (name === "hoodie") {
    p.roundBlock(38, R.neckY + drop - 4, 20, 12, 5, hexMix(BASE, -10));
    p.roundBlock(38, R.torsoY + drop + 18, 20, 10, 3, hexMix(BASE, -18));
    if (!back) {
      p.rect(44, R.neckY + drop + 6, 1, 10, WHITE);
      p.rect(51, R.neckY + drop + 6, 1, 10, WHITE);
    }
    if (back) p.discShade(CX, R.neckY + drop - 4, 12, 8, hexMix(BASE, -12));
  } else if (name === "sweater") {
    p.roundBlock(38, R.neckY + drop - 2, 20, 8, 3, hexMix(BASE, -18));
  } else if (name === "jacket") {
    p.roundBlock(45, R.torsoY + drop, 6, 32, 1, "#d8d0c4");
    p.rect(47, R.torsoY + drop + 2, 1, 28, INK);
  } else if (name === "tank") {
    p.roundBlock(37, R.torsoY + drop, 5, 8, 1, hexMix(BASE, -16));
    p.roundBlock(54, R.torsoY + drop, 5, 8, 1, hexMix(BASE, -16));
  }
  return finish(p);
}

/** rh — hands over cuffs, always the last body layer so sleeves never swallow them. */
function partRh(walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const hy = sit ? -8 : 0;
  p.discShade(R.handLX, R.handLY + drop + a + hy, 5.2, 4.6, BASE);
  p.discShade(R.handRX, R.handRY + drop + b + hy, 5.2, 4.6, BASE);
  return finish(p);
}

/** sh — two shoes on the locked foot pivots. */
function partSh(name: string, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const yL = R.shoeLY + drop + (sit ? -8 : 0);
  const yR = R.shoeRY + drop + (sit ? -8 : 0);
  if (name === "slides" || name === "flats") {
    p.discShade(40, yL + a + 6, 8, 4.5, BASE);
    p.discShade(56, yR + b + 6, 8, 4.5, BASE);
    return finish(p);
  }
  const lift = name === "boots" ? 10 : name === "hightops" ? 6 : 0;
  p.roundBlock(R.shoeLX, yL + a - lift, R.shoeW, R.shoeH + lift, 3, BASE);
  p.roundBlock(R.shoeRX, yR + b - lift, R.shoeW, R.shoeH + lift, 3, BASE);
  p.discShade(R.shoeLX + 10, yL + a + 6, 7, 4, BASE);
  p.discShade(R.shoeRX + 10, yR + b + 6, 7, 4, BASE);
  if (name !== "boots") {
    p.roundBlock(R.shoeLX, yL + a + R.shoeH - 3, R.shoeW, 3, 1, "#f2f2f4");
    p.roundBlock(R.shoeRX, yR + b + R.shoeH - 3, R.shoeW, 3, 1, "#f2f2f4");
  }
  return finish(p);
}

function cached(key: string, make: () => Pix) {
  const hit = partCache.get(key);
  if (hit) return hit;
  const p = make();
  if (partCache.size > 400) {
    const first = partCache.keys().next().value;
    if (first) partCache.delete(first);
  }
  partCache.set(key, p);
  return p;
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const pal = palOf(f);
  const g = f.gender ?? 0;
  const girl = g === 1;
  const view = opts.view ?? (opts.back ? 2 : 1);
  const back = view === 2 || view === 3;
  const walk = opts.walk ?? 0;
  const sit = !!opts.sit;
  const hairName = hairsFor(g)[f.hair] || defaultHairName(g);
  const topName = topsFor(g)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(g)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(g)[f.shoeCut ?? 0] || "sneakers";

  // Habbo draw order (front): hrb → bd → sh → lg → ch → rh → hd → hr → fc
  const hrb = cached(`hrb.${hairName}`, () => dye(partHrb(hairName), pal.hair));
  const bd = cached(`bd.${pal.skin}.${girl}.${walk}.${sit}`, () => dye(partBd(girl, walk, sit), pal.skin));
  const sh = cached(`sh.${shoeName}.${pal.shoe}.${walk}.${sit}`, () => dye(partSh(shoeName, walk, sit), pal.shoe));
  const lg = cached(`lg.${botName}.${pal.bot}.${girl}.${walk}.${sit}`, () => dye(partLg(botName, girl, walk, sit), pal.bot));
  const ch = cached(`ch.${topName}.${pal.top}.${back}.${sit}`, () => dye(partCh(topName, back, sit), pal.top));
  const rh = cached(`rh.${pal.skin}.${walk}.${sit}`, () => dye(partRh(walk, sit), pal.skin));
  const hd = cached(`hd.${pal.skin}`, () => dye(partHd(), pal.skin));
  const hr = cached(`hr.${hairName}.${pal.hair}.${back}`, () => dye(partHr(hairName, back), pal.hair));
  const fc = cached(`fc.${girl}`, () => partFc(girl));

  const out = blank();
  out.blit(hrb);
  out.blit(bd);
  out.blit(sh);
  out.blit(lg);
  out.blit(ch);
  out.blit(rh);
  out.blit(hd);
  out.blit(hr);
  if (!back) out.blit(fc);
  out.outline(INK);
  if (view === 0 || view === 3) return flipH(out);
  return out;
}

export function lookKey(fig: Figure, opts: LookOpts = {}) {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
  return [
    figureString(f),
    view,
    opts.walk ?? 0,
    opts.sit ? 1 : 0,
  ].join(".");
}

export function premadeId(fig: Figure) {
  return figureString(fig);
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
