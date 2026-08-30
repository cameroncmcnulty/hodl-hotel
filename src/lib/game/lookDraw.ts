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

const INK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];
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

function C(hex: string) {
  return rgb(hex);
}
function D(hex: string) {
  return mix(hex, -28);
}

function oval(p: Pix, cx: number, cy: number, rx: number, ry: number, c: [number, number, number]) {
  p.disc(cx, cy, rx, ry, c);
}

function box(p: Pix, x: number, y: number, w: number, h: number, c: [number, number, number]) {
  p.rect(x, y, w, h, c);
}

function drawHead(p: Pix, skin: string) {
  oval(p, CX, 52, 25, 27, C(skin));
  oval(p, CX - 8, 42, 8, 7, mix(skin, 20));
}

function drawFace(p: Pix) {
  oval(p, 40, 54, 5, 6, WHITE);
  oval(p, 56, 54, 5, 6, WHITE);
  oval(p, 40, 55, 2.4, 3, INK);
  oval(p, 56, 55, 2.4, 3, INK);
  p.set(41, 53, WHITE);
  p.set(57, 53, WHITE);
  box(p, 46, 66, 4, 2, INK);
}

function punchFace(p: Pix, skin: string) {
  oval(p, CX, 56, 18, 17, C(skin));
  oval(p, CX - 6, 48, 6, 5, mix(skin, 16));
}

function drawBackHair(p: Pix, style: string, col: string, girl: boolean) {
  const h = C(col);
  if (girl) {
    if (style === "pony") {
      oval(p, 24, 44, 8, 10, h);
      box(p, 16, 44, 10, 28, h);
      oval(p, 21, 72, 7, 7, h);
    } else if (style === "pigtails") {
      oval(p, 20, 42, 7, 7, h);
      oval(p, 76, 42, 7, 7, h);
      box(p, 16, 44, 8, 16, h);
      box(p, 72, 44, 8, 16, h);
    } else if (style === "long" || style === "waves") {
      box(p, 20, 50, 10, 40, h);
      box(p, 66, 50, 10, 40, h);
      oval(p, 25, 90, 8, 8, h);
      oval(p, 71, 90, 8, 8, h);
    }
    return;
  }
  if (style === "afro") oval(p, CX, 46, 28, 26, h);
}

function drawFrontHair(p: Pix, style: string, col: string, girl: boolean, skin: string) {
  const h = C(col);
  if (girl) {
    oval(p, CX, 34, 26, 20, h);
    box(p, 26, 38, 12, 18, h);
    box(p, 58, 38, 12, 18, h);
    if (style === "bob") {
      oval(p, 27, 58, 10, 12, h);
      oval(p, 69, 58, 10, 12, h);
    }
    if (style === "bun") oval(p, CX, 14, 8, 7, h);
    punchFace(p, skin);
    box(p, 30, 40, 36, 8, h);
    oval(p, 38, 42, 6, 5, h);
    oval(p, 48, 40, 6, 5, h);
    oval(p, 58, 42, 6, 5, h);
    return;
  }
  if (style === "afro") {
    punchFace(p, skin);
    box(p, 34, 40, 28, 6, h);
    return;
  }
  if (style === "mohawk") {
    box(p, 44, 10, 8, 28, h);
    oval(p, CX, 12, 6, 6, h);
    return;
  }
  if (style === "spikes") {
    oval(p, CX, 34, 16, 10, h);
    box(p, 34, 16, 5, 20, h);
    box(p, 45, 12, 6, 24, h);
    box(p, 57, 16, 5, 20, h);
    punchFace(p, skin);
    return;
  }
  if (style === "undercut") {
    oval(p, CX, 32, 14, 10, h);
    punchFace(p, skin);
    return;
  }
  if (style === "side") {
    oval(p, 38, 34, 16, 14, h);
    box(p, 48, 32, 16, 14, h);
    punchFace(p, skin);
    box(p, 32, 40, 28, 6, h);
    return;
  }
  oval(p, CX, 32, 22, 16, h);
  punchFace(p, skin);
  box(p, 30, 40, 36, 7, h);
}

function drawLegs(p: Pix, skin: string) {
  box(p, 37, 116, 9, 28, C(skin));
  box(p, 50, 116, 9, 28, C(skin));
}

function drawTorso(p: Pix, skin: string) {
  box(p, 36, 78, 24, 40, C(skin));
  box(p, 44, 74, 8, 6, C(skin));
}

function drawArms(p: Pix, skin: string, sleeveless: boolean) {
  const y0 = sleeveless ? 80 : 110;
  const h = sleeveless ? 36 : 10;
  box(p, 26, y0, 7, h, C(skin));
  box(p, 63, y0, 7, h, C(skin));
}

function drawHands(p: Pix, skin: string) {
  oval(p, 29, 124, 5, 5, C(skin));
  oval(p, 67, 124, 5, 5, C(skin));
}

function drawBot(p: Pix, name: string, col: string, girl: boolean) {
  const c = C(col);
  const d = D(col);
  if (girl && (name === "skirt" || name === "pleat")) {
    for (let y = 112; y <= 138; y++) {
      const t = (y - 112) / 26;
      const w = Math.round(12 + t * 14);
      box(p, CX - w, y, w * 2, 1, c);
    }
    if (name === "pleat") {
      box(p, 42, 116, 2, 20, d);
      box(p, 48, 116, 2, 20, d);
      box(p, 54, 116, 2, 20, d);
    }
    return;
  }
  const y1 = name === "shorts" ? 134 : 146;
  box(p, 36, 112, 11, y1 - 112, c);
  box(p, 49, 112, 11, y1 - 112, c);
  box(p, 36, 112, 24, 6, c);
  if (name === "cargo") {
    box(p, 32, 126, 8, 8, d);
    box(p, 56, 126, 8, 8, d);
  }
  if (name === "joggers") {
    box(p, 36, 140, 11, 6, d);
    box(p, 49, 140, 11, 6, d);
  }
  if (name === "jeans") {
    box(p, 41, 118, 2, 22, mix(col, 40));
    box(p, 53, 118, 2, 22, mix(col, 40));
  }
}

function drawTop(p: Pix, name: string, col: string) {
  const c = C(col);
  const d = D(col);
  if (name === "hoodie") {
    box(p, 34, 78, 28, 36, c);
    box(p, 24, 80, 10, 32, c);
    box(p, 62, 80, 10, 32, c);
    box(p, 38, 74, 20, 8, c);
    box(p, 40, 92, 16, 12, d);
    box(p, 44, 82, 2, 10, WHITE);
    box(p, 50, 82, 2, 10, WHITE);
    return;
  }
  box(p, 35, 78, 26, 36, c);
  if (name === "tee") {
    box(p, 25, 80, 10, 14, c);
    box(p, 61, 80, 10, 14, c);
    oval(p, CX, 78, 6, 4, C(col));
  } else if (name === "jacket") {
    box(p, 24, 80, 11, 34, c);
    box(p, 61, 80, 11, 34, c);
    box(p, 44, 78, 8, 36, C("#e6e0d4"));
    box(p, 34, 78, 12, 36, d);
    box(p, 50, 78, 12, 36, d);
  } else if (name === "tank") {
    box(p, 37, 78, 5, 6, d);
    box(p, 54, 78, 5, 6, d);
  } else if (name === "sweater") {
    box(p, 24, 80, 11, 34, c);
    box(p, 61, 80, 11, 34, c);
    box(p, 38, 74, 20, 8, d);
    box(p, 35, 108, 26, 6, d);
  }
}

function drawShoes(p: Pix, name: string, col: string) {
  const c = C(col);
  if (name === "boots") {
    box(p, 35, 140, 12, 22, c);
    box(p, 49, 140, 12, 22, c);
    return;
  }
  if (name === "hightops") {
    box(p, 35, 144, 12, 18, c);
    box(p, 49, 144, 12, 18, c);
    box(p, 35, 158, 12, 4, WHITE);
    box(p, 49, 158, 12, 4, WHITE);
    return;
  }
  if (name === "slides" || name === "flats") {
    box(p, 35, 154, 12, 8, c);
    box(p, 49, 154, 12, 8, c);
    return;
  }
  box(p, 35, 148, 12, 14, c);
  box(p, 49, 148, 12, 14, c);
  box(p, 35, 158, 12, 4, WHITE);
  box(p, 49, 158, 12, 4, WHITE);
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
  drawHead(p, pal.skin);
  drawFrontHair(p, hairName, pal.hair, girl, pal.skin);
  drawFace(p);
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
