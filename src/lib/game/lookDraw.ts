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
const INK: RGB = [12, 8, 14];
const WHITE: RGB = [255, 255, 255];
const BASE = "#8c8c8c";
const CX = 48;

/**
 * Style lock: hotel-sticker chibi.
 * Same 2:1 dimetric lighting as the furniture (light NW, dark SE, one highlight),
 * 2-heads-tall bobble, giant sparkle eyes, stubby isometric body, 1px ink.
 * Feet stay near the canvas bottom so the sprite plants on a tile.
 */
const R = {
  headX: 48,
  headY: 86,
  headRx: 27,
  headRy: 26,
  earLX: 24,
  earLY: 92,
  earRX: 72,
  earRY: 88,
  torsoX: 35,
  torsoY: 110,
  torsoW: 26,
  torsoH: 22,
  armW: 8,
  armH: 22,
  armLX: 26,
  armLY: 114,
  armRX: 62,
  armRY: 112,
  handLX: 30,
  handLY: 138,
  handRX: 66,
  handRY: 136,
  legW: 10,
  legH: 24,
  legLX: 36,
  legLY: 130,
  legRX: 50,
  legRY: 128,
  shoeW: 14,
  shoeH: 9,
  shoeLX: 34,
  shoeLY: 154,
  shoeRX: 50,
  shoeRY: 152,
};

function onFace(x: number, y: number) {
  const dx = (x - CX) / 19;
  const dy = (y - (R.headY + 4)) / 18;
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
  const drop = sit ? 16 : 0;
  const a = sit ? 0 : walk ? 3 : 0;
  const b = sit ? 0 : walk ? -3 : 0;
  return { drop, a, b, sit };
}

/** Soft sticker ball: mostly mid, thin NW light / SE shade, one highlight. */
function ball(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  const lit = mix(hex, 28);
  const mid = rgb(hex);
  const dim = mix(hex, -30);
  const hi = mix(hex, 52);
  const rx2 = rx * rx || 1;
  const ry2 = ry * ry || 1;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const n = (dx * dx) / rx2 + (dy * dy) / ry2;
      if (n > 1.02) continue;
      const t = dx / (rx * 2) + dy / (ry * 2);
      p.set(x, y, t < -0.52 ? lit : t > 0.5 ? dim : mid);
    }
  }
  p.disc(cx - rx * 0.4, cy - ry * 0.44, Math.max(2, rx * 0.14), Math.max(1.5, ry * 0.1), hi);
}

function blob(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  p.disc(cx, cy, rx, ry, rgb(hex));
}

/** One rim pass over a merged silhouette — furniture lighting, no inner rings. */
function rimShade(p: Pix, hex: string) {
  const lit = mix(hex, 24);
  const dim = mix(hex, -28);
  const mid = rgb(hex);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.a(x, y) < 8) continue;
      const nw = p.a(x - 1, y) < 8 || p.a(x, y - 1) < 8;
      const se = p.a(x + 1, y) < 8 || p.a(x, y + 1) < 8;
      p.set(x, y, nw ? lit : se ? dim : mid);
    }
  }
}

function chunk(p: Pix, x: number, y: number, w: number, h: number, hex: string) {
  p.roundBlock(x, y, w, h, Math.min(4, Math.floor(w / 3)), hex);
}

function maskFace(src: Pix) {
  const p = blank();
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      if (src.a(x, y) < 8) continue;
      if (onFace(x, y)) continue;
      const i = (y * src.w + x) * 4;
      p.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]], src.d[i + 3]);
    }
  }
  return p;
}

/** bd — stubby torso, arms, legs. No head. Clothes cover this. */
function partBd(girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const tw = girl ? 24 : 26;
  const tx = CX - Math.floor(tw / 2);
  p.capsule(R.armLX, R.armLY + drop, R.armW, sit ? 16 : R.armH, BASE);
  p.capsule(R.armRX, R.armRY + drop, R.armW, sit ? 16 : R.armH, BASE);
  p.trap(tx + 2, tx + tw - 2, R.torsoY + drop, tx - 1, tx + tw + 1, R.torsoY + drop + (sit ? 16 : R.torsoH), BASE);
  if (sit) {
    chunk(p, R.legLX - 2, R.legLY + drop - 8, 16, 12, BASE);
    chunk(p, R.legRX - 2, R.legRY + drop - 6, 16, 12, BASE);
    p.capsule(R.legLX + 1, R.legLY + drop + 2, 9, 16, BASE);
    p.capsule(R.legRX + 1, R.legRY + drop + 4, 9, 16, BASE);
  } else {
    p.capsule(R.legLX, R.legLY + drop + a, R.legW, R.legH, BASE);
    p.capsule(R.legRX, R.legRY + drop + b, R.legW, R.legH, BASE);
  }
  return finish(p);
}

/** hd — big round skull + ears. Chin sits on the collar. */
function partHd(): Pix {
  const p = blank();
  ball(p, R.headX, R.headY, R.headRx, R.headRy, BASE);
  ball(p, R.headX, R.headY + 12, 18, 14, BASE);
  ball(p, R.earLX, R.earLY, 3.2, 3.6, BASE);
  ball(p, R.earRX, R.earRY, 3.2, 3.6, BASE);
  return finish(p);
}

/** fc + ey — giant sparkle eyes, tiny smile. Never dyed. */
function partFc(girl: boolean): Pix {
  const p = blank();
  const ey = R.headY + 4;
  p.disc(37, ey, 5.8, 6.6, WHITE);
  p.disc(59, ey - 1, 5.8, 6.6, WHITE);
  p.disc(37, ey + 1, 2.8, 3.2, INK);
  p.disc(59, ey, 2.8, 3.2, INK);
  p.set(35, ey - 1, WHITE);
  p.set(57, ey - 2, WHITE);
  p.rect(34, ey - 6, 7, 1, INK);
  p.rect(56, ey - 7, 7, 1, INK);
  const my = R.headY + 20;
  p.set(45, my, [210, 110, 120]);
  p.set(46, my + 1, [210, 110, 120]);
  p.set(47, my + 1, [210, 110, 120]);
  p.set(48, my + 1, [210, 110, 120]);
  p.set(49, my + 1, [210, 110, 120]);
  p.set(50, my, [210, 110, 120]);
  if (girl) {
    ball(p, 30, ey + 10, 3.2, 2.2, "#f4a7b0");
    ball(p, 66, ey + 9, 3.2, 2.2, "#f4a7b0");
  }
  return p;
}

/** hrb — hair behind the skull (tails). */
function partHrb(style: string): Pix {
  const p = blank();
  if (style === "pony") {
    blob(p, 22, R.headY - 4, 8, 9, BASE);
    p.rect(18, R.headY, 8, 30, rgb(BASE));
    blob(p, 21, R.headY + 34, 8, 8, BASE);
  } else if (style === "pigtails") {
    blob(p, 18, R.headY, 7, 8, BASE);
    blob(p, 78, R.headY - 2, 7, 8, BASE);
    p.rect(16, R.headY + 4, 6, 16, rgb(BASE));
    p.rect(76, R.headY + 2, 6, 16, rgb(BASE));
    blob(p, 18, R.headY + 24, 6.5, 6.5, BASE);
    blob(p, 80, R.headY + 22, 6.5, 6.5, BASE);
  } else if (style === "long" || style === "waves") {
    p.rect(20, R.headY + 4, 10, 38, rgb(BASE));
    p.rect(66, R.headY + 4, 10, 38, rgb(BASE));
    blob(p, 24, R.headY + 42, 8, 8, BASE);
    blob(p, 72, R.headY + 42, 8, 8, BASE);
    if (style === "waves") {
      blob(p, 22, R.headY + 28, 7, 6, BASE);
      blob(p, 74, R.headY + 28, 7, 6, BASE);
    }
  }
  rimShade(p, BASE);
  return finish(p);
}

/** hr — hair cap on the skull. Face stays open so eyes always read. */
function partHr(style: string, back: boolean): Pix {
  const raw = blank();
  if (back) {
    blob(raw, CX, R.headY - 2, 24, 26, BASE);
    blob(raw, 28, R.headY - 8, 10, 12, BASE);
    blob(raw, 68, R.headY - 8, 10, 12, BASE);
    blob(raw, CX, R.headY - 20, 12, 10, BASE);
  }
  if (style === "afro") {
    blob(raw, CX, R.headY - 10, 28, 26, BASE);
    blob(raw, 24, R.headY - 8, 10, 11, BASE);
    blob(raw, 72, R.headY - 10, 10, 11, BASE);
  } else if (style === "mohawk") {
    raw.rect(44, R.headY - 32, 8, 28, rgb(BASE));
    raw.spike(CX, R.headY - 36, R.headY - 4, 6, BASE);
  } else if (style === "spikes") {
    blob(raw, CX, R.headY - 16, 14, 10, BASE);
    raw.spike(32, R.headY - 30, R.headY - 2, 5, BASE);
    raw.spike(48, R.headY - 34, R.headY - 4, 6, BASE);
    raw.spike(64, R.headY - 30, R.headY - 2, 5, BASE);
  } else {
    blob(raw, CX, R.headY - 14, 23, 18, BASE);
    blob(raw, 28, R.headY - 8, 11, 12, BASE);
    blob(raw, 68, R.headY - 10, 11, 12, BASE);
    if (style === "side") {
      blob(raw, 26, R.headY - 10, 14, 13, BASE);
      blob(raw, 68, R.headY - 4, 7, 7, BASE);
    }
    if (style === "undercut") raw.block(26, R.headY - 2, 44, 3, hexMix(BASE, -40));
    if (style === "bob") {
      blob(raw, 26, R.headY + 6, 10, 11, BASE);
      blob(raw, 70, R.headY + 4, 10, 11, BASE);
    }
    if (style === "bun") blob(raw, CX, R.headY - 30, 9, 8, BASE);
    if (style === "messy") {
      blob(raw, 36, R.headY - 26, 8, 7, BASE);
      blob(raw, 54, R.headY - 28, 8, 7, BASE);
      blob(raw, 46, R.headY - 30, 7, 6, BASE);
    }
  }
  rimShade(raw, BASE);
  return finish(back ? raw : maskFace(raw));
}

/** lg — trousers / skirt. Same leg pivots as bd. */
function partLg(name: string, girl: boolean, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const skirt = girl && (name === "skirt" || name === "pleat");
  const short = name === "shorts";
  const h = sit ? 14 : short ? 14 : 26;
  if (skirt) {
    const y0 = R.torsoY + drop + 16;
    p.trap(CX - 11, CX + 11, y0, CX - 20, CX + 20, y0 + 22, BASE);
    chunk(p, CX - 12, y0, 24, 5, hexMix(BASE, -16));
    if (name === "pleat") {
      p.rect(40, y0 + 6, 1, 14, mix(BASE, -50));
      p.rect(48, y0 + 6, 1, 16, mix(BASE, -50));
      p.rect(56, y0 + 6, 1, 14, mix(BASE, -50));
    }
    return finish(p);
  }
  if (sit) {
    chunk(p, R.legLX - 2, R.legLY + drop - 10, 16, 14, BASE);
    chunk(p, R.legRX - 2, R.legRY + drop - 8, 16, 14, BASE);
    p.capsule(R.legLX, R.legLY + drop + 2, 10, 14, BASE);
    p.capsule(R.legRX, R.legRY + drop + 4, 10, 14, BASE);
    return finish(p);
  }
  p.capsule(R.legLX - 1, R.legLY + drop + a, R.legW + 2, h, BASE);
  p.capsule(R.legRX - 1, R.legRY + drop + b, R.legW + 2, h, BASE);
  chunk(p, R.legLX - 1, R.legLY + drop - 4, 28, 10, BASE);
  if (name === "jeans") {
    p.rect(40, R.legLY + drop + 4, 1, 16, mix(BASE, 50));
    p.rect(56, R.legLY + drop + 2, 1, 16, mix(BASE, 50));
  }
  if (name === "cargo") {
    chunk(p, R.legLX - 4, R.legLY + drop + 8, 7, 8, hexMix(BASE, -16));
    chunk(p, R.legRX + 7, R.legRY + drop + 8, 7, 8, hexMix(BASE, -16));
  }
  if (name === "joggers") {
    chunk(p, R.legLX - 1, R.legLY + drop + h - 6, R.legW + 2, 6, hexMix(BASE, -20));
    chunk(p, R.legRX - 1, R.legRY + drop + h - 6, R.legW + 2, 6, hexMix(BASE, -20));
  }
  return finish(p);
}

/** ch — chest + sleeves. Sleeves share the arm pivots so every shirt fits the same holes. */
function partCh(name: string, back: boolean, sit: boolean): Pix {
  const p = blank();
  const drop = sit ? 16 : 0;
  const sleeveH = sit ? 14 : name === "tee" ? 12 : 20;
  p.trap(R.torsoX + 2, R.torsoX + R.torsoW - 2, R.torsoY + drop, R.torsoX - 1, R.torsoX + R.torsoW + 1, R.torsoY + drop + (sit ? 18 : R.torsoH + 2), BASE);
  ball(p, CX, R.torsoY + drop + 3, 10, 5, BASE);
  if (name !== "tank") {
    p.capsule(R.armLX, R.armLY + drop, R.armW, sleeveH, BASE);
    p.capsule(R.armRX, R.armRY + drop, R.armW, sleeveH, BASE);
  }
  if (name === "hoodie") {
    chunk(p, 34, R.torsoY + drop - 14, 28, 16, hexMix(BASE, -8));
    if (!back) {
      p.rect(45, R.torsoY + drop - 4, 1, 6, WHITE);
      p.rect(50, R.torsoY + drop - 4, 1, 6, WHITE);
    }
    if (back) blob(p, CX, R.torsoY + drop - 8, 12, 8, hexMix(BASE, -12));
  } else if (name === "sweater") {
    chunk(p, 38, R.torsoY + drop - 6, 20, 8, hexMix(BASE, -16));
  } else if (name === "jacket") {
    chunk(p, 45, R.torsoY + drop, 6, 22, "#d8d0c4");
    p.rect(47, R.torsoY + drop + 2, 1, 18, INK);
  } else if (name === "tank") {
    chunk(p, 38, R.torsoY + drop, 5, 7, hexMix(BASE, -16));
    chunk(p, 53, R.torsoY + drop, 5, 7, hexMix(BASE, -16));
  }
  return finish(p);
}

/** rh — hands over cuffs so sleeves never swallow them. */
function partRh(walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const hy = sit ? -6 : 0;
  ball(p, R.handLX, R.handLY + drop + a + hy, 5, 4.4, BASE);
  ball(p, R.handRX, R.handRY + drop + b + hy, 5, 4.4, BASE);
  return finish(p);
}

/** sh — two chunky isometric sneakers, like mini ottomans. */
function partSh(name: string, walk: number, sit: boolean): Pix {
  const p = blank();
  const { drop, a, b } = pose(walk, sit);
  const yL = R.shoeLY + drop + (sit ? -6 : 0);
  const yR = R.shoeRY + drop + (sit ? -6 : 0);
  if (name === "slides" || name === "flats") {
    ball(p, 40, yL + a + 4, 8, 4.5, BASE);
    ball(p, 56, yR + b + 4, 8, 4.5, BASE);
    return finish(p);
  }
  const lift = name === "boots" ? 8 : name === "hightops" ? 5 : 0;
  chunk(p, R.shoeLX, yL + a - lift, R.shoeW, R.shoeH + lift, BASE);
  chunk(p, R.shoeRX, yR + b - lift, R.shoeW, R.shoeH + lift, BASE);
  ball(p, R.shoeLX + 10, yL + a + 4, 6, 3.5, BASE);
  ball(p, R.shoeRX + 10, yR + b + 4, 6, 3.5, BASE);
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
