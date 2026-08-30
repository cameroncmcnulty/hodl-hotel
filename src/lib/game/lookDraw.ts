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

function drawLegs(p: Pix, skin: string) {
  p.capsule(36, 112, 10, 40, skin);
  p.capsule(50, 112, 10, 40, skin);
}

function drawTorso(p: Pix, skin: string) {
  p.trap(35, 61, 70, 37, 59, 114, skin);
  p.rect(44, 64, 8, 8, mix(skin, -8));
}

function drawArms(p: Pix, skin: string, sleeveless: boolean) {
  const y0 = sleeveless ? 72 : 108;
  const h = sleeveless ? 48 : 16;
  p.capsule(23, y0, 8, h, skin);
  p.capsule(65, y0, 8, h, skin);
}

function drawHands(p: Pix, skin: string) {
  p.discShade(27, 122, 5, 4.5, skin);
  p.discShade(69, 122, 5, 4.5, skin);
}

function drawHead(p: Pix, skin: string, girl: boolean) {
  p.discShade(CX, 42, girl ? 21 : 20, girl ? 23 : 22, skin);
}

function drawFace(p: Pix, girl: boolean) {
  p.disc(40, 46, 4.2, 5, WHITE);
  p.disc(56, 46, 4.2, 5, WHITE);
  p.disc(40, 47, 2.2, 2.6, INK);
  p.disc(56, 47, 2.2, 2.6, INK);
  p.set(41, 45, WHITE);
  p.set(57, 45, WHITE);
  if (girl) {
    p.rect(36, 42, 3, 1, INK);
    p.rect(57, 42, 3, 1, INK);
    p.disc(40, 58, 2, 1.4, mix("#e07a8a", 0));
    p.disc(56, 58, 2, 1.4, mix("#e07a8a", 0));
  }
  p.rect(46, 58, 4, 2, mix("#b45a62", -6));
}

function drawBackHair(p: Pix, style: string, col: string, girl: boolean) {
  if (girl) {
    if (style === "pony") {
      p.discShade(26, 36, 8, 9, col);
      p.capsule(19, 38, 9, 32, col);
      p.discShade(23, 70, 7, 7, col);
    } else if (style === "pigtails") {
      p.discShade(22, 38, 7, 7, col);
      p.discShade(74, 38, 7, 7, col);
      p.capsule(17, 42, 7, 18, col);
      p.capsule(72, 42, 7, 18, col);
    } else if (style === "long") {
      p.capsule(22, 44, 10, 46, col);
      p.capsule(64, 44, 10, 46, col);
    } else if (style === "waves") {
      p.discShade(24, 52, 9, 12, col);
      p.discShade(72, 52, 9, 12, col);
      p.discShade(26, 72, 8, 10, col);
      p.discShade(70, 72, 8, 10, col);
    }
    return;
  }
  if (style === "afro") p.discShade(CX, 38, 26, 24, col);
}

function punchFace(p: Pix, skin: string, girl: boolean) {
  p.discShade(CX, 46, girl ? 16 : 15, girl ? 16 : 15, skin, (_x, y) => y >= 36);
}

function bangs(p: Pix, col: string) {
  p.rect(34, 34, 28, 7, rgb(col));
  p.discShade(40, 36, 6, 4, col);
  p.discShade(48, 35, 6, 4, col);
  p.discShade(56, 36, 6, 4, col);
}

function drawFrontHair(p: Pix, style: string, col: string, girl: boolean, skin: string) {
  if (girl) {
    p.discShade(CX, 30, 22, 16, col);
    p.discShade(30, 40, 9, 12, col);
    p.discShade(66, 40, 9, 12, col);
    if (style === "bob") {
      p.discShade(29, 54, 9, 12, col);
      p.discShade(67, 54, 9, 12, col);
    }
    if (style === "bun") p.discShade(CX, 12, 8, 7, col);
    punchFace(p, skin, true);
    bangs(p, col);
    return;
  }
  if (style === "afro") {
    punchFace(p, skin, false);
    bangs(p, col);
    return;
  }
  if (style === "mohawk") {
    p.discShade(CX, 20, 6, 14, col);
    p.spike(CX, 6, 22, 5, col);
    return;
  }
  if (style === "spikes") {
    p.discShade(CX, 28, 16, 10, col);
    p.spike(36, 14, 32, 4, col);
    p.spike(48, 10, 30, 5, col);
    p.spike(60, 14, 32, 4, col);
    punchFace(p, skin, false);
    return;
  }
  if (style === "undercut") {
    p.discShade(CX, 26, 15, 10, col);
    punchFace(p, skin, false);
    return;
  }
  if (style === "side") {
    p.discShade(36, 28, 15, 13, col);
    p.discShade(56, 30, 11, 10, col);
    punchFace(p, skin, false);
    bangs(p, col);
    return;
  }
  p.discShade(CX, 26, 18, 12, col);
  punchFace(p, skin, false);
  bangs(p, col);
}

function drawBot(p: Pix, name: string, col: string, girl: boolean) {
  if (girl && (name === "skirt" || name === "pleat")) {
    p.trap(36, 60, 110, 28, 68, 136, col);
    if (name === "pleat") {
      p.rect(42, 114, 2, 18, mix(col, -30));
      p.rect(48, 114, 2, 18, mix(col, -30));
      p.rect(54, 114, 2, 18, mix(col, -30));
    }
    return;
  }
  const short = name === "shorts";
  const y1 = short ? 134 : 150;
  p.capsule(36, 110, 11, y1 - 110, col);
  p.capsule(49, 110, 11, y1 - 110, col);
  p.roundBlock(37, 108, 22, 10, 3, col);
  if (name === "cargo") {
    p.roundBlock(33, 126, 8, 9, 2, hexMix(col, -16));
    p.roundBlock(55, 126, 8, 9, 2, hexMix(col, -16));
  }
  if (name === "joggers") {
    p.roundBlock(36, 144, 11, 6, 2, hexMix(col, -20));
    p.roundBlock(49, 144, 11, 6, 2, hexMix(col, -20));
  }
  if (name === "jeans") {
    p.rect(41, 118, 2, 24, mix(col, 32));
    p.rect(53, 118, 2, 24, mix(col, 32));
  }
}

function drawTop(p: Pix, name: string, col: string) {
  if (name === "hoodie") {
    p.trap(32, 64, 70, 36, 60, 112, col);
    p.capsule(22, 74, 11, 36, col);
    p.capsule(63, 74, 11, 36, col);
    p.roundBlock(38, 88, 20, 16, 5, hexMix(col, -18));
    p.roundBlock(38, 64, 20, 8, 3, col);
    p.rect(44, 76, 2, 12, WHITE);
    p.rect(50, 76, 2, 12, WHITE);
    return;
  }
  p.trap(33, 63, 70, 37, 59, 112, col);
  if (name === "tee") {
    p.capsule(22, 72, 10, 16, col);
    p.capsule(64, 72, 10, 16, col);
    p.disc(CX, 70, 6, 4, mix(col, 20));
  } else if (name === "jacket") {
    p.capsule(21, 72, 11, 38, col);
    p.capsule(64, 72, 11, 38, col);
    p.rect(44, 72, 8, 38, mix("#d8d2c8", 0));
    p.trap(33, 44, 70, 37, 44, 110, hexMix(col, -10));
    p.trap(52, 63, 70, 52, 59, 110, hexMix(col, -10));
  } else if (name === "tank") {
    p.rect(36, 70, 5, 8, mix(col, -20));
    p.rect(55, 70, 5, 8, mix(col, -20));
  } else if (name === "sweater") {
    p.capsule(22, 72, 11, 38, col);
    p.capsule(63, 72, 11, 38, col);
    p.roundBlock(38, 66, 20, 8, 3, hexMix(col, -22));
    p.roundBlock(36, 106, 24, 6, 2, hexMix(col, -18));
  }
}

function drawShoes(p: Pix, name: string, col: string) {
  if (name === "boots") {
    p.roundBlock(34, 142, 13, 24, 3, col);
    p.roundBlock(49, 142, 13, 24, 3, col);
    return;
  }
  if (name === "hightops") {
    p.roundBlock(34, 146, 13, 20, 3, col);
    p.roundBlock(49, 146, 13, 20, 3, col);
    p.rect(34, 162, 13, 4, WHITE);
    p.rect(49, 162, 13, 4, WHITE);
    return;
  }
  if (name === "slides" || name === "flats") {
    p.discShade(40, 160, 8, 5, col);
    p.discShade(56, 160, 8, 5, col);
    return;
  }
  p.roundBlock(34, 152, 13, 14, 4, col);
  p.roundBlock(49, 152, 13, 14, 4, col);
  p.rect(34, 162, 13, 4, WHITE);
  p.rect(49, 162, 13, 4, WHITE);
}

function paintChibi(f: Figure): Pix {
  const girl = (f.gender ?? 0) === 1;
  const pal = palOf(f);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  const sleeveless = topName === "tank";
  const p = new Pix(LOOK_W, LOOK_H);
  drawBackHair(p, hairName, pal.hair, girl);
  drawLegs(p, pal.skin);
  drawBot(p, botName, pal.bot, girl);
  drawTorso(p, pal.skin);
  drawArms(p, pal.skin, sleeveless);
  drawTop(p, topName, pal.top);
  drawHands(p, pal.skin);
  drawShoes(p, shoeName, pal.shoe);
  drawHead(p, pal.skin, girl);
  drawFrontHair(p, hairName, pal.hair, girl, pal.skin);
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
