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

export type LookOpts = { back?: boolean; walk?: 0 | 1; sit?: boolean };

const INK: [number, number, number] = [16, 12, 20];
const WHITE: [number, number, number] = [248, 248, 252];
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

function drawBody(p: Pix, skin: string, girl: boolean) {
  p.capsule(35, 118, 10, 38, skin);
  p.capsule(51, 118, 10, 38, skin);
  p.trap(34, 62, 74, 36, 60, 120, skin);
  p.capsule(22, 78, 9, 46, skin);
  p.capsule(65, 78, 9, 46, skin);
  p.discShade(26, 126, 5.5, 5, skin);
  p.discShade(70, 126, 5.5, 5, skin);
  p.rect(44, 66, 8, 10, mix(skin, -6));
  p.discShade(CX, 44, girl ? 23 : 22, girl ? 25 : 24, skin);
}

function drawFace(p: Pix, girl: boolean) {
  p.disc(40, 50, 5.5, 6, WHITE);
  p.disc(56, 50, 5.5, 6, WHITE);
  p.disc(40, 51, 2.8, 3.2, INK);
  p.disc(56, 51, 2.8, 3.2, INK);
  p.set(41, 49, WHITE);
  p.set(57, 49, WHITE);
  if (girl) {
    p.rect(35, 45, 3, 2, INK);
    p.rect(58, 45, 3, 2, INK);
  }
  p.rect(46, 62, 4, 2, mix("#c45c6a", -8));
}

function drawBackHair(p: Pix, style: string, col: string, girl: boolean) {
  if (!girl) return;
  if (style === "pony") {
    p.capsule(20, 36, 9, 34, col);
    p.discShade(24, 72, 7, 8, col);
  } else if (style === "pigtails") {
    p.capsule(18, 42, 7, 20, col);
    p.capsule(71, 42, 7, 20, col);
    p.discShade(22, 40, 6, 6, col);
    p.discShade(74, 40, 6, 6, col);
  } else if (style === "long" || style === "waves") {
    p.capsule(22, 48, 9, 44, col);
    p.capsule(65, 48, 9, 44, col);
  }
}

function drawFrontHair(p: Pix, style: string, col: string, girl: boolean) {
  if (girl) {
    p.discShade(CX, 32, 22, 14, col);
    p.rect(30, 40, 8, 12, rgb(col));
    p.rect(58, 40, 8, 12, rgb(col));
    p.rect(36, 40, 24, 6, rgb(col));
    if (style === "bob") {
      p.rect(28, 48, 8, 16, rgb(col));
      p.rect(60, 48, 8, 16, rgb(col));
    } else if (style === "bun") {
      p.discShade(CX, 16, 8, 7, col);
    } else if (style === "waves") {
      p.discShade(28, 64, 7, 9, col);
      p.discShade(68, 64, 7, 9, col);
    }
    return;
  }
  if (style === "afro") {
    p.discShade(CX, 34, 24, 20, col, (_x, y) => y < 52);
    return;
  }
  if (style === "mohawk") {
    p.rect(45, 12, 6, 24, rgb(col));
    p.spike(CX, 8, 26, 5, col);
    return;
  }
  if (style === "spikes") {
    p.discShade(CX, 34, 16, 10, col);
    p.spike(38, 18, 36, 4, col);
    p.spike(48, 14, 34, 5, col);
    p.spike(58, 18, 36, 4, col);
    return;
  }
  if (style === "undercut") {
    p.discShade(CX, 32, 15, 10, col);
    return;
  }
  if (style === "side") {
    p.discShade(40, 34, 15, 12, col);
    p.rect(52, 36, 12, 10, rgb(col));
    return;
  }
  p.discShade(CX, 32, 18, 12, col);
  p.discShade(34, 30, 6, 5, col);
  p.discShade(62, 30, 5, 5, col);
}

function drawBot(p: Pix, name: string, col: string, girl: boolean) {
  if (girl && (name === "skirt" || name === "pleat")) {
    p.trap(34, 62, 116, 26, 70, 142, col);
    if (name === "pleat") {
      p.rect(40, 120, 2, 18, mix(col, -28));
      p.rect(48, 120, 2, 18, mix(col, -28));
      p.rect(56, 120, 2, 18, mix(col, -28));
    }
    return;
  }
  const short = name === "shorts";
  const y1 = short ? 138 : 154;
  p.capsule(35, 116, 11, y1 - 116, col);
  p.capsule(50, 116, 11, y1 - 116, col);
  p.rect(36, 116, 24, 8, rgb(col));
  if (name === "cargo") {
    p.rect(33, 132, 8, 9, mix(col, -18));
    p.rect(55, 132, 8, 9, mix(col, -18));
  }
  if (name === "joggers") {
    p.rect(35, 148, 11, 6, mix(col, -22));
    p.rect(50, 148, 11, 6, mix(col, -22));
  }
  if (name === "jeans") {
    p.rect(40, 124, 2, 22, mix(col, 28));
    p.rect(54, 124, 2, 22, mix(col, 28));
  }
}

function drawTop(p: Pix, name: string, col: string, _girl: boolean) {
  const sleeveless = name === "tank";
  const shortSleeve = name === "tee";
  p.trap(32, 64, 74, 36, 60, 118, col);
  if (!sleeveless) {
    const sleeveH = shortSleeve ? 18 : 40;
    p.capsule(20, 76, 11, sleeveH, col);
    p.capsule(65, 76, 11, sleeveH, col);
  }
  if (name === "hoodie") {
    p.rect(36, 66, 24, 10, rgb(col));
    p.rect(44, 80, 2, 12, WHITE);
    p.rect(50, 80, 2, 12, WHITE);
  }
  if (name === "jacket") {
    p.rect(46, 76, 4, 40, mix(col, 36));
    p.trap(32, 46, 74, 36, 46, 116, hexMix(col, -14));
    p.trap(50, 64, 74, 50, 60, 116, hexMix(col, -14));
  }
  if (name === "sweater") {
    p.rect(40, 70, 16, 8, mix(col, -18));
  }
  if (name === "tank") {
    p.rect(36, 74, 5, 8, mix(col, -16));
    p.rect(55, 74, 5, 8, mix(col, -16));
  }
}

function drawShoes(p: Pix, name: string, col: string) {
  const y0 = name === "boots" ? 146 : name === "hightops" ? 150 : 156;
  p.rect(33, y0, 13, 168 - y0, rgb(col));
  p.rect(50, y0, 13, 168 - y0, rgb(col));
  if (name === "sneakers" || name === "skate" || name === "hightops") {
    p.rect(33, 164, 13, 4, WHITE);
    p.rect(50, 164, 13, 4, WHITE);
  }
}

function paintChibi(f: Figure): Pix {
  const girl = (f.gender ?? 0) === 1;
  const pal = palOf(f);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  const p = new Pix(LOOK_W, LOOK_H);
  drawBackHair(p, hairName, pal.hair, girl);
  drawBody(p, pal.skin, girl);
  drawBot(p, botName, pal.bot, girl);
  drawTop(p, topName, pal.top, girl);
  drawShoes(p, shoeName, pal.shoe);
  drawFrontHair(p, hairName, pal.hair, girl);
  drawFace(p, girl);
  p.outline(INK);
  return p;
}

export function paintLook(fig: Figure, _opts: LookOpts = {}): Pix {
  return paintChibi(clampFigure(fig));
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
