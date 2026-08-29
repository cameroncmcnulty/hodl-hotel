import type { Figure } from "../types";
import { Pix, rgb, mix, hexMix } from "./pix";

export const LOOK_W = 80;
export const LOOK_H = 128;
export const LOOK_SCALE = 1;

export const SKIN = ["#f3d4c4", "#e8c4a8", "#d4a574", "#c48a56", "#b56c3a", "#8d4e24", "#6b3a20", "#3a1c10"];
export const HAIR_BOY_C = ["#8b5a2b", "#5c3317", "#1b1b1b", "#e8d07a", "#c45c26", "#4a2c0a"];
export const HAIR_GIRL_C = ["#8b5a2b", "#1a1a1a", "#111111", "#e8d07a", "#c45c26", "#ff8fab"];
export const HAIR_C = HAIR_BOY_C;

export const HAIR_BOY = ["messy", "side", "afro", "undercut", "spikes"];
export const HAIR_GIRL = ["pony", "waves", "bob", "long", "pigtails"];
export const TOP_BOY = ["hoodie", "tee"];
export const TOP_GIRL = ["hoodie", "tee"];
export const BOT_BOY = ["pants", "shorts"];
export const BOT_GIRL = ["skirt", "pants", "shorts"];
export const SHOE_BOY = ["sneakers"];
export const SHOE_GIRL = ["sneakers", "flats"];
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
  "1-hoodie": ["#ff8fab", "#7c3aed", "#f4f4f6", "#9a9a9a", "#3b82f6"],
  "1-tee": ["#ff8fab", "#f4f4f6", "#e8b931", "#c41e3a", "#1a1a1e"],
};
const BOT_PAL: Record<string, string[]> = {
  "0-pants": ["#1a1a1e", "#1e3a5f", "#6d4c2f", "#9a9a9a", "#c4a574"],
  "0-shorts": ["#9a9a9a", "#1e3a5f", "#1a1a1e", "#c41e3a", "#166534"],
  "1-skirt": ["#1e3a8a", "#ff8fab", "#1a1a1e", "#9a9a9a", "#c41e3a"],
  "1-pants": ["#1a1a1e", "#1e3a5f", "#3b82f6", "#9a9a9a", "#6d4c2f"],
  "1-shorts": ["#ff8fab", "#1a1a1e", "#f4f4f6", "#1e3a8a", "#9a9a9a"],
};
const SHOE_PAL: Record<string, string[]> = {
  "0-sneakers": ["#c41e3a", "#f4f4f6", "#1a1a1e", "#3b82f6", "#9a9a9a"],
  "1-sneakers": ["#c41e3a", "#f4f4f6", "#1a1a1e", "#ff8fab", "#3b82f6"],
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

type Pal = { skin: string; hair: string; top: string; bot: string; shoe: string };
type Style = { hair: string; top: string; bot: string; shoe: string; girl: boolean };

function palOf(f: Figure): Pal {
  return {
    skin: SKIN[f.skin] || SKIN[2],
    hair: hairColors(f.gender ?? 0)[f.hairColor] || HAIR_BOY_C[0],
    top: topColors(f.gender ?? 0, f.topCut ?? 0)[f.top] || TOPS[0],
    bot: botColors(f.gender ?? 0, f.botCut ?? 0)[f.bottom] || BOTTOMS[0],
    shoe: shoeColors(f.gender ?? 0, f.shoeCut ?? 0)[f.shoes] || SHOES[0],
  };
}

function styleOf(f: Figure): Style {
  const g = f.gender ?? 0;
  return {
    hair: hairsFor(g)[f.hair] || defaultHairName(g),
    top: topsFor(g)[f.topCut ?? 0] || "hoodie",
    bot: botsFor(g)[f.botCut ?? 0] || (g === 1 ? "skirt" : "pants"),
    shoe: shoesFor(g)[f.shoeCut ?? 0] || "sneakers",
    girl: g === 1,
  };
}

const CX = 40;
const HEAD = { cx: 40, cy: 34, rx: 18, ry: 20 };
const FACE_Y = 30;

function inHead(x: number, y: number, pad = 0) {
  const dx = x - HEAD.cx;
  const dy = y - HEAD.cy;
  const rx = HEAD.rx + pad;
  const ry = HEAD.ry + pad;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.02;
}

function drawHead(p: Pix, skin: string, girl: boolean) {
  p.discShade(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, skin);
  p.discShade(HEAD.cx, HEAD.cy + 3, HEAD.rx - 2, HEAD.ry - 3, skin);
  p.discShade(21, 38, 4.2, 5.5, skin);
  p.discShade(59, 38, 4.2, 5.5, skin);
  p.block(36, 52, 8, 7, skin);
  if (girl) {
    p.disc(30, 44, 2.2, 1.6, mix("#e89aa8", 12));
    p.disc(50, 44, 2.2, 1.6, mix("#e89aa8", 12));
  }
}

function drawTorso(p: Pix, skin: string, girl: boolean, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  if (girl) p.trap(26, 54, 56, 28, 52, 90, skin);
  else p.trap(24, 56, 56, 26, 54, 90, skin);
  p.capsule(17, 58, 8, 30, skin);
  p.capsule(55, 58, 8, 30, skin);
  p.capsule(29 + wob, 88, 9, 28, skin);
  p.capsule(42 - wob, 88, 9, 28, skin);
}

function drawEye(p: Pix, cx: number, cy: number, girl: boolean) {
  const ink: [number, number, number] = [20, 14, 22];
  const white: [number, number, number] = [255, 252, 250];
  const shine: [number, number, number] = [255, 255, 255];
  if (girl) {
    p.disc(cx, cy, 5.4, 6.4, ink);
    p.disc(cx, cy, 4.5, 5.5, white);
    p.disc(cx, cy + 0.8, 3.3, 3.9, ink);
    p.set(cx - 1, cy - 1, shine);
    p.set(cx, cy - 1, shine);
    p.set(cx - 5, cy - 5, ink);
    p.set(cx - 6, cy - 4, ink);
    p.set(cx + 5, cy - 5, ink);
    p.set(cx + 6, cy - 4, ink);
    return;
  }
  p.disc(cx, cy, 3.6, 4.3, ink);
  p.disc(cx, cy, 2.8, 3.5, white);
  p.disc(cx, cy + 0.4, 2.5, 2.9, ink);
  p.set(cx - 1, cy - 1, shine);
}

function drawFace(p: Pix, girl: boolean, back: boolean) {
  if (back) return;
  if (girl) {
    drawEye(p, 32, 36, true);
    drawEye(p, 48, 36, true);
  } else {
    drawEye(p, 33, 36, false);
    drawEye(p, 47, 36, false);
  }
}

function hairCap(p: Pix, hex: string, extra = 2, hem = FACE_Y) {
  p.discShade(HEAD.cx, HEAD.cy - 3, HEAD.rx + extra, HEAD.ry + extra - 2, hex, (x, y) => y <= hem + 2 || !inHead(x, y, -1));
  p.discShade(HEAD.cx, HEAD.cy - 8, HEAD.rx + extra + 1, HEAD.ry - 4, hex);
}

function drawHairBack(p: Pix, s: Style, hair: string, back: boolean) {
  if (s.hair === "pony") {
    p.discShade(18, 22, 7, 6, hair);
    p.discShade(14, 32, 7, 10, hair);
    p.discShade(13, 46, 6, 10, hair);
    p.discShade(14, 58, 5, 7, hair);
    p.discShade(16, 66, 4, 5, hair);
  }
  if (s.hair === "pigtails") {
    p.discShade(14, 32, 8, 8, hair);
    p.discShade(66, 32, 8, 8, hair);
    p.discShade(12, 44, 7, 9, hair);
    p.discShade(68, 44, 7, 9, hair);
  }
  if (s.hair === "long" || s.hair === "waves") {
    p.trap(18, 28, 36, 16, 28, 92, hair);
    p.trap(52, 62, 36, 52, 64, 92, hair);
    p.discShade(20, 92, 6, 5, hair);
    p.discShade(60, 92, 6, 5, hair);
    if (s.hair === "waves") {
      p.discShade(20, 52, 7, 8, hair);
      p.discShade(20, 72, 7, 8, hair);
      p.discShade(60, 52, 7, 8, hair);
      p.discShade(60, 72, 7, 8, hair);
    }
  }
  if (back) p.discShade(CX, 40, 14, 14, hair);
}

function drawHairFront(p: Pix, s: Style, hair: string, back: boolean) {
  const hem = back ? 50 : FACE_Y;
  if (s.hair === "afro") {
    p.discShade(CX, 30, 24, 22, hair);
    const bumps: [number, number, number, number][] = [
      [22, 18, 7, 16],
      [32, 12, 8, -14],
      [40, 10, 9, 12],
      [48, 12, 8, -18],
      [58, 18, 7, 14],
      [18, 30, 7, -12],
      [62, 30, 7, 10],
      [22, 42, 6, -16],
      [58, 42, 6, 14],
      [28, 16, 6, 18],
      [52, 16, 6, -10],
      [40, 18, 6, 8],
    ];
    for (const [x, y, r, amt] of bumps) p.discShade(x, y, r, r * 0.9, hexMix(hair, amt));
    return;
  }
  if (s.hair === "undercut") {
    p.discShade(CX, 18, 14, 11, hair);
    p.discShade(CX + 2, 16, 12, 9, hair);
    p.discShade(36, 18, 6, 6, hair, (x, y) => y <= 24);
    p.discShade(46, 16, 7, 7, hair, (x, y) => y <= 24);
    return;
  }
  if (s.hair === "spikes") {
    hairCap(p, hair, 1, 28);
    p.spike(26, 6, 22, 3.2, hair);
    p.spike(32, 4, 22, 3.6, hair);
    p.spike(40, 2, 22, 4, hair);
    p.spike(48, 4, 22, 3.6, hair);
    p.spike(54, 6, 22, 3.2, hair);
    p.discShade(24, 24, 5, 6, hair, (x, y) => y <= 30);
    p.discShade(56, 24, 5, 6, hair, (x, y) => y <= 30);
    return;
  }
  if (s.hair === "messy") {
    hairCap(p, hair, 2, 31);
    p.discShade(28, 16, 7, 7, hair);
    p.discShade(36, 12, 8, 7, hair);
    p.discShade(46, 12, 8, 7, hair);
    p.discShade(54, 16, 7, 7, hair);
    p.discShade(22, 32, 7, 8, hair, (x, y) => y <= 40);
    p.discShade(58, 32, 7, 8, hair, (x, y) => y <= 40);
    p.discShade(34, 28, 7, 5, hair, (x, y) => y <= 33);
    p.discShade(48, 28, 6, 5, hair, (x, y) => y <= 33);
    return;
  }
  if (s.hair === "side") {
    p.discShade(CX + 4, HEAD.cy - 5, HEAD.rx + 1, HEAD.ry - 3, hair, (x, y) => y <= 30);
    p.discShade(50, 18, 12, 10, hair, (x, y) => y <= 32);
    p.discShade(54, 26, 8, 8, hair, (x, y) => y <= 34);
    p.trap(32, 60, 12, 38, 62, 30, hair);
    return;
  }
  if (s.hair === "pony") {
    hairCap(p, hair, 2, 31);
    p.discShade(34, 22, 10, 7, hair, (x, y) => y <= 32);
    p.discShade(28, 28, 7, 5, hair, (x, y) => y <= 33);
    p.discShade(50, 26, 8, 6, hair, (x, y) => y <= 33);
    p.trap(20, 28, 28, 12, 22, 40, hair);
    p.rect(16, 28, 8, 3, mix(hair, 36));
    return;
  }
  if (s.hair === "waves") {
    hairCap(p, hair, 3, 31);
    p.discShade(22, 36, 9, 14, hair, (x, y) => x <= 30 || y <= hem);
    p.discShade(58, 36, 9, 14, hair, (x, y) => x >= 50 || y <= hem);
    p.discShade(28, 26, 8, 6, hair, (x, y) => y <= 32);
    p.discShade(52, 26, 8, 6, hair, (x, y) => y <= 32);
    return;
  }
  if (s.hair === "bob") {
    hairCap(p, hair, 3, 32);
    p.discShade(CX, 36, 20, 18, hair, (x, y) => y <= 52 && (y <= hem || !inHead(x, y, -2)));
    p.discShade(22, 38, 7, 10, hair);
    p.discShade(58, 38, 7, 10, hair);
    p.discShade(32, 24, 8, 5, hair, (x, y) => y <= 32);
    p.discShade(50, 24, 7, 5, hair, (x, y) => y <= 32);
    return;
  }
  if (s.hair === "long") {
    hairCap(p, hair, 2, 31);
    p.trap(18, 28, 32, 16, 28, 92, hair);
    p.trap(52, 62, 32, 52, 64, 92, hair);
    p.discShade(30, 24, 8, 5, hair, (x, y) => y <= 32);
    p.discShade(22, 42, 6, 8, hair);
    p.discShade(58, 42, 6, 8, hair);
    return;
  }
  if (s.hair === "pigtails") {
    hairCap(p, hair, 2, 31);
    p.discShade(14, 28, 8, 7, hair);
    p.discShade(66, 28, 8, 7, hair);
    p.discShade(12, 40, 8, 9, hair);
    p.discShade(68, 40, 8, 9, hair);
    const band = mix(hair, 48);
    p.rect(10, 34, 8, 3, band);
    p.rect(62, 34, 8, 3, band);
    p.discShade(32, 24, 8, 5, hair, (x, y) => y <= 32);
    return;
  }
  hairCap(p, hair, 2, hem);
}

function punchFace(p: Pix, skin: string, back: boolean) {
  if (back) return;
  p.discShade(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, skin, (x, y) => y >= FACE_Y && inHead(x, y, 0));
}

function drawBottom(p: Pix, s: Style, bot: string, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  const belt = mix(bot, -28);
  if (s.bot === "skirt") {
    p.trap(28, 52, 86, 20, 60, 104, bot);
    p.rect(28, 86, 24, 3, belt);
    p.rect(32, 90, 2, 12, mix(bot, -20));
    p.rect(40, 90, 2, 12, mix(bot, 16));
    p.rect(48, 90, 2, 12, mix(bot, -16));
    return;
  }
  if (s.bot === "shorts") {
    if (s.girl) {
      p.trap(28, 52, 86, 24, 56, 100, bot);
      p.rect(28, 86, 24, 3, belt);
      return;
    }
    p.capsule(28 + wob, 86, 10, 16, bot);
    p.capsule(42 - wob, 86, 10, 16, bot);
    p.rect(28, 86, 24, 3, belt);
    return;
  }
  p.capsule(28 + wob, 86, 10, 28, bot);
  p.capsule(42 - wob, 86, 10, 28, bot);
  p.rect(28, 86, 24, 3, belt);
}

function drawSocks(p: Pix, s: Style, walk: 0 | 1) {
  if (!s.girl) return;
  if (s.bot !== "skirt" && s.bot !== "shorts") return;
  if (s.shoe === "flats") return;
  const wob = walk ? 1 : 0;
  const sock = "#f4f4f6";
  p.capsule(31 + wob, 102, 7, 14, sock);
  p.capsule(42 - wob, 102, 7, 14, sock);
}

function drawShoes(p: Pix, s: Style, shoe: string, walk: 0 | 1) {
  const wob = walk ? 1 : 0;
  const white = rgb("#f4f4f6");
  const soleCol: [number, number, number] = [236, 232, 236];
  const lx = 28 + wob;
  const rx = 52 - wob;
  if (s.shoe === "flats") {
    p.discShade(lx, 118, 8, 5, shoe);
    p.discShade(rx, 118, 8, 5, shoe);
    p.rect(lx - 7, 120, 15, 3, mix(shoe, -40));
    p.rect(rx - 7, 120, 15, 3, mix(shoe, -40));
    p.rect(lx - 4, 115, 10, 2, mix(shoe, 28));
    p.rect(rx - 4, 115, 10, 2, mix(shoe, 28));
    p.disc(lx + 4, 117, 2, 2, mix(shoe, 40));
    p.disc(rx + 4, 117, 2, 2, mix(shoe, 40));
    return;
  }
  p.discShade(lx, 116, 8, 6, shoe);
  p.discShade(rx, 116, 8, 6, shoe);
  p.block(lx - 6, 112, 13, 9, shoe);
  p.block(rx - 6, 112, 13, 9, shoe);
  p.rect(lx - 8, 121, 16, 4, soleCol);
  p.rect(rx - 8, 121, 16, 4, soleCol);
  const cap = shoe.toLowerCase() === "#f4f4f6" ? mix(shoe, -50) : white;
  p.rect(lx - 6, 117, 5, 4, cap);
  p.rect(rx + 1, 117, 5, 4, cap);
  p.rect(lx - 1, 113, 4, 2, white);
  p.rect(rx - 1, 113, 4, 2, white);
}

function drawTop(p: Pix, s: Style, top: string, skin: string) {
  const stringCol = mix(top, 70);
  if (s.top === "hoodie") {
    if (s.girl) p.trap(24, 56, 56, 26, 54, 92, top);
    else p.trap(22, 58, 56, 24, 56, 92, top);
    p.block(24, 70, 32, 22, top);
    p.discShade(CX, 90, 15, 5, top);
    p.capsule(16, 58, 10, 30, top);
    p.capsule(54, 58, 10, 30, top);
    p.block(16, 84, 10, 5, hexMix(top, -20));
    p.block(54, 84, 10, 5, hexMix(top, -20));
    p.trap(31, 49, 76, 33, 47, 90, hexMix(top, -10));
    p.discShade(CX, 58, 7, 5, top);
    p.trap(38, 42, 56, 39, 41, 64, skin);
    p.rect(37, 60, 1, 12, stringCol);
    p.rect(42, 60, 1, 12, stringCol);
    p.rect(36, 72, 3, 2, stringCol);
    p.rect(41, 72, 3, 2, stringCol);
    return;
  }
  if (s.girl) p.trap(26, 54, 58, 28, 52, 90, top);
  else p.trap(24, 56, 58, 26, 54, 90, top);
  p.discShade(CX, 88, 12, 4, top);
  p.capsule(17, 58, 10, 16, top);
  p.capsule(53, 58, 10, 16, top);
  p.block(17, 72, 10, 3, hexMix(top, -16));
  p.block(53, 72, 10, 3, hexMix(top, -16));
  p.discShade(CX, 60, 6, 5, skin, (x, y) => y >= 56 && y <= 66);
}

function drawHands(p: Pix, skin: string) {
  p.discShade(20, 90, 5.2, 5, skin);
  p.discShade(60, 90, 5.2, 5, skin);
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const pal = palOf(f);
  const s: Style = { ...styleOf(f), girl: (f.gender ?? 0) === 1 };
  const back = !!opts.back;
  const walk = (opts.walk ?? 0) as 0 | 1;
  const p = new Pix(LOOK_W, LOOK_H);

  drawHairBack(p, { ...s, girl: s.girl }, pal.hair, back);
  drawHead(p, pal.skin, s.girl);
  drawTorso(p, pal.skin, s.girl, walk);
  drawBottom(p, s, pal.bot, walk);
  drawSocks(p, s, walk);
  drawShoes(p, s, pal.shoe, walk);
  drawTop(p, s, pal.top, pal.skin);
  drawHands(p, pal.skin);
  drawHairFront(p, s, pal.hair, back);
  punchFace(p, pal.skin, back);
  drawFace(p, s.girl, back);
  p.outline([16, 10, 18]);
  return p;
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
