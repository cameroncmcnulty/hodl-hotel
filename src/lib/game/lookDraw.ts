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

type Pose = "front" | "side" | "back";
type RGB = [number, number, number];

const INK: RGB = [12, 9, 14];
const WHITE: RGB = [255, 255, 255];
const CREAM: RGB = [236, 228, 214];
const SOLE: RGB = [244, 244, 246];
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

function lum(hex: string) {
  const [r, g, b] = rgb(hex);
  return r * 0.3 + g * 0.54 + b * 0.16;
}
function contrast(hex: string): RGB {
  return lum(hex) > 138 ? mix(hex, -96) : mix(hex, 92);
}

function oval(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  const rx2 = rx * rx || 1;
  const ry2 = ry * ry || 1;
  const hi = mix(hex, 72);
  const lit = mix(hex, 38);
  const mid = rgb(hex);
  const dim = mix(hex, -36);
  const deep = mix(hex, -60);
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const r2 = dx * dx + dy * dy;
      if (r2 > 1.02) continue;
      const n = dx * 0.6 + dy * 0.78;
      let c: RGB = mid;
      if (n > 0.56) c = deep;
      else if (n > 0.2) c = dim;
      else if (n < -0.62 && r2 < 0.52) c = hi;
      else if (n < -0.26) c = lit;
      p.set(x, y, c);
    }
  }
}

function puff(p: Pix, cx: number, cy: number, rx: number, ry: number, hex: string) {
  oval(p, cx, cy, rx, ry, hex);
  if (rx < 6) return;
  p.disc(cx - rx * 0.32, cy - ry * 0.38, Math.max(1.2, rx * 0.2), Math.max(1, ry * 0.14), mix(hex, 64));
}

function box(p: Pix, x: number, y: number, w: number, h: number, hex: string, rad = 2) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const ww = Math.round(w);
  const hh = Math.round(h);
  if (ww < 1 || hh < 1) return;
  const r = Math.max(0, Math.min(rad, Math.floor(ww / 2), Math.floor(hh / 2)));
  const lit = mix(hex, 36);
  const mid = rgb(hex);
  const dim = mix(hex, -38);
  const deep = mix(hex, -62);
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
      let c: RGB = mid;
      if (i <= 1 || j === 0) c = lit;
      if (i >= ww - 2) c = dim;
      if (j >= hh - 2) c = dim;
      if (i >= ww - 1 && j >= 1) c = deep;
      p.set(x0 + i, y0 + j, c);
    }
  }
}

function cap(p: Pix, x: number, y: number, w: number, h: number, hex: string) {
  const ww = Math.max(4, Math.round(w));
  const hh = Math.max(ww, Math.round(h));
  const r = ww / 2;
  oval(p, x + r, y + r, r, r * 0.92, hex);
  if (hh > ww) box(p, x, y + r - 1, ww, hh - ww + 2, hex, 0);
  oval(p, x + r, y + hh - r, r, r * 0.92, hex);
}

function rib(p: Pix, x: number, y: number, w: number, h: number, hex: string) {
  for (let j = 0; j < h; j++) {
    p.rect(x, y + j, w, 1, j % 2 === 0 ? mix(hex, 22) : mix(hex, -22));
  }
}

function ink(p: Pix, x: number, y: number, w = 1, h = 1) {
  p.rect(x, y, w, h, INK);
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

function sleeveKind(top: string): "none" | "short" | "long" {
  if (top === "tank") return "none";
  if (top === "tee") return "short";
  return "long";
}

function headBall(p: Pix, cx: number, cy: number, rx: number, ry: number, skin: string) {
  oval(p, cx, cy, rx, ry, skin);
  p.disc(cx - rx * 0.38, cy - ry * 0.44, 3.4, 2.5, mix(skin, 88));
  p.set(Math.round(cx - rx * 0.42), Math.round(cy - ry * 0.5), WHITE);
  p.set(Math.round(cx - rx * 0.42) + 1, Math.round(cy - ry * 0.5), mix(skin, 96));
  const chin = mix(skin, -28);
  for (let i = -8; i <= 8; i++) {
    p.set(Math.round(cx + i), Math.round(cy + ry - 2), chin);
    if (Math.abs(i) < 6) p.set(Math.round(cx + i), Math.round(cy + ry - 1), mix(skin, -44));
  }
}

function ear(p: Pix, skin: string, x: number, y: number) {
  puff(p, x, y, 4.4, 5.6, skin);
  p.disc(x - 1, y, 1.6, 2.2, mix(skin, -30));
}

function eye(p: Pix, x: number, y: number, girl: boolean, side = false) {
  const rx = side ? 5.2 : 6.2;
  const ry = side ? 6.4 : 7.2;
  p.disc(x, y, rx, ry, WHITE);
  const lid = [210, 186, 176] as RGB;
  for (let i = -Math.floor(rx); i <= Math.floor(rx); i++) {
    const t = 1 - (i * i) / (rx * rx);
    if (t < 0.15) continue;
    p.set(x + i, y - Math.round(ry) + 1, lid);
  }
  p.disc(x + (side ? 1 : 0), y + 1, girl ? 2.6 : 2.8, girl ? 3.2 : 3.4, INK);
  p.set(x + 1, y - 1, WHITE);
  p.set(x + 2, y - 1, WHITE);
  ink(p, x - (girl ? 4 : 3), y - Math.round(ry) - 2, girl ? 8 : 7, 1);
  if (girl) {
    ink(p, x - 5, y - 2, 1, 1);
    ink(p, x, y - Math.round(ry), 1, 1);
    ink(p, x + 5, y - 2, 1, 1);
  }
}

function faceFront(p: Pix, girl: boolean, skin: string) {
  eye(p, 39, 52, girl);
  eye(p, 57, 52, girl);
  if (girl) {
    puff(p, 36, 62, 3.2, 2.2, "#e0909a");
    puff(p, 60, 62, 3.2, 2.2, "#e0909a");
  }
  p.set(47, 58, mix(skin, -36));
  p.set(48, 59, mix(skin, -22));
  ink(p, 45, 66, 6, 2);
  p.set(46, 65, mix("#c45c6a", 10));
  p.set(47, 67, mix("#c45c6a", -20));
}

function faceSide(p: Pix, girl: boolean, skin: string) {
  eye(p, 58, 52, girl, true);
  oval(p, 70, 56, 4.2, 5.2, skin);
  p.set(72, 55, mix(skin, 40));
  p.set(73, 57, mix(skin, -30));
  if (girl) puff(p, 62, 62, 2.8, 2, "#e0909a");
  ink(p, 64, 66, 4, 2);
  p.set(65, 65, mix("#c45c6a", 10));
}

function punchFace(p: Pix, skin: string, pose: Pose) {
  if (pose === "back") return;
  if (pose === "side") {
    oval(p, 60, 54, 11, 13, skin);
    oval(p, 66, 56, 7, 11, skin);
    return;
  }
  oval(p, CX, 56, 15, 14, skin);
}

function hairBack(p: Pix, style: string, col: string, girl: boolean, pose: Pose) {
  if (pose === "back") {
    puff(p, CX, 46, 26, 28, col);
    puff(p, 30, 40, 12, 14, col);
    puff(p, 66, 40, 12, 14, col);
    puff(p, 40, 22, 10, 10, col);
    puff(p, 56, 20, 11, 10, col);
    puff(p, CX, 18, 12, 9, col);
    if (style === "afro") {
      puff(p, CX, 44, 32, 31, col);
      puff(p, 24, 36, 12, 12, col);
      puff(p, 72, 38, 12, 12, col);
      puff(p, 32, 22, 10, 10, col);
      puff(p, 64, 20, 10, 10, col);
      puff(p, 48, 14, 12, 10, col);
      puff(p, 22, 52, 9, 10, col);
      puff(p, 74, 52, 9, 10, col);
    }
    if (girl && style === "pony") {
      puff(p, 26, 36, 10, 12, col);
      cap(p, 16, 40, 12, 36, col);
      puff(p, 22, 78, 9, 10, col);
      puff(p, 20, 90, 8, 8, col);
      box(p, 20, 38, 8, 5, hexMix(col, -40), 2);
    }
    if (girl && style === "pigtails") {
      puff(p, 16, 40, 9, 10, col);
      puff(p, 80, 40, 9, 10, col);
      cap(p, 12, 46, 9, 22, col);
      cap(p, 75, 46, 9, 22, col);
      puff(p, 16, 70, 7, 7, col);
      puff(p, 80, 70, 7, 7, col);
      box(p, 14, 42, 7, 4, hexMix(col, -40), 2);
      box(p, 75, 42, 7, 4, hexMix(col, -40), 2);
    }
    if (girl && (style === "long" || style === "waves")) {
      cap(p, 16, 48, 14, 52, col);
      cap(p, 66, 48, 14, 52, col);
      puff(p, 22, 100, 9, 10, col);
      puff(p, 74, 100, 9, 10, col);
      if (style === "waves") {
        puff(p, 20, 64, 10, 12, col);
        puff(p, 76, 64, 10, 12, col);
        puff(p, 22, 82, 9, 10, col);
        puff(p, 74, 82, 9, 10, col);
      }
    }
    if (girl && style === "bun") {
      puff(p, CX, 16, 12, 11, col);
      puff(p, CX - 4, 12, 6, 5, hexMix(col, 36));
    }
    if (style === "mohawk") {
      box(p, 44, 8, 8, 40, col, 2);
      p.spike(CX, 2, 28, 6, col);
      puff(p, CX, 18, 6, 8, hexMix(col, 24));
    }
    return;
  }

  if (pose === "side") {
    puff(p, 36, 42, 16, 20, col);
    puff(p, 28, 36, 12, 14, col);
    puff(p, 32, 24, 10, 10, col);
    if (girl && (style === "long" || style === "waves" || style === "pony")) {
      cap(p, 18, 44, 12, 40, col);
      puff(p, 24, 84, 8, 9, col);
    }
    if (girl && style === "pigtails") {
      puff(p, 18, 38, 8, 9, col);
      cap(p, 14, 44, 8, 20, col);
      puff(p, 18, 66, 6, 6, col);
    }
    return;
  }

  if (style === "afro") {
    puff(p, CX, 44, 31, 30, col);
    puff(p, 22, 40, 11, 12, col);
    puff(p, 74, 40, 11, 12, col);
    puff(p, 30, 22, 10, 10, col);
    puff(p, 66, 20, 10, 10, col);
    puff(p, 48, 16, 12, 10, col);
    puff(p, 20, 56, 8, 9, col);
    puff(p, 76, 56, 8, 9, col);
    return;
  }
  if (girl && style === "pony") {
    puff(p, 22, 40, 10, 12, col);
    cap(p, 14, 44, 12, 34, col);
    puff(p, 20, 80, 9, 9, col);
    puff(p, 18, 92, 7, 7, col);
    puff(p, 24, 70, 5, 5, hexMix(col, 30));
  } else if (girl && style === "pigtails") {
    puff(p, 16, 38, 9, 10, col);
    puff(p, 80, 38, 9, 10, col);
    cap(p, 12, 44, 9, 20, col);
    cap(p, 75, 44, 9, 20, col);
    puff(p, 16, 66, 7, 7, col);
    puff(p, 80, 66, 7, 7, col);
  } else if (girl && style === "long") {
    cap(p, 16, 50, 14, 54, col);
    cap(p, 66, 50, 14, 54, col);
    puff(p, 22, 104, 9, 9, col);
    puff(p, 74, 104, 9, 9, col);
    puff(p, 20, 72, 8, 10, col);
    puff(p, 76, 72, 8, 10, col);
  } else if (girl && style === "waves") {
    puff(p, 20, 48, 11, 14, col);
    puff(p, 76, 48, 11, 14, col);
    puff(p, 22, 68, 10, 12, col);
    puff(p, 74, 68, 10, 12, col);
    puff(p, 24, 88, 9, 10, col);
    puff(p, 72, 88, 9, 10, col);
    puff(p, 26, 104, 7, 8, col);
    puff(p, 70, 104, 7, 8, col);
  } else if (girl && style === "bob") {
    puff(p, 24, 56, 11, 14, col);
    puff(p, 72, 56, 11, 14, col);
  }
}

function hairCap(p: Pix, style: string, col: string, girl: boolean, pose: Pose) {
  if (pose === "back") {
    puff(p, CX, 38, 24, 24, col);
    puff(p, 32, 32, 13, 14, col);
    puff(p, 64, 32, 13, 14, col);
    puff(p, 40, 18, 11, 11, col);
    puff(p, 56, 16, 12, 11, col);
    puff(p, CX, 14, 13, 10, col);
    puff(p, 26, 48, 9, 11, col);
    puff(p, 70, 48, 9, 11, col);
    if (style === "afro") {
      puff(p, CX, 40, 30, 28, col);
      puff(p, 22, 34, 12, 12, col);
      puff(p, 74, 34, 12, 12, col);
    }
    if (style === "mohawk") {
      box(p, 44, 6, 8, 42, col, 2);
      p.spike(CX, 2, 28, 6, col);
    }
    if (style === "spikes") {
      p.spike(32, 8, 34, 4, col);
      p.spike(42, 4, 32, 5, col);
      p.spike(54, 4, 32, 5, col);
      p.spike(64, 8, 34, 4, col);
    }
    if (girl && style === "bun") {
      puff(p, CX, 14, 12, 11, col);
      puff(p, CX - 4, 10, 6, 5, hexMix(col, 32));
    }
    return;
  }
  if (pose === "side") {
    puff(p, 40, 26, 16, 16, col);
    puff(p, 32, 30, 13, 14, col);
    puff(p, 46, 16, 11, 10, col);
    puff(p, 38, 18, 9, 8, col);
    puff(p, 50, 18, 11, 9, col);
    puff(p, 56, 26, 8, 8, col);
    puff(p, 28, 40, 10, 12, col);
    if (style === "mohawk") {
      box(p, 46, 4, 7, 34, col, 2);
      p.spike(50, 0, 26, 5, col);
    } else if (style === "spikes") {
      p.spike(38, 6, 30, 4, col);
      p.spike(46, 2, 28, 5, col);
      p.spike(54, 6, 30, 4, col);
    } else if (style === "afro") {
      puff(p, 42, 36, 22, 22, col);
      puff(p, 30, 28, 12, 12, col);
    } else if (style === "bun") {
      puff(p, 44, 12, 10, 9, col);
    }
    return;
  }
  if (style === "afro") {
    puff(p, CX, 30, 24, 18, col);
    puff(p, 26, 36, 13, 14, col);
    puff(p, 70, 36, 13, 14, col);
    puff(p, 36, 18, 12, 11, col);
    puff(p, 60, 16, 12, 11, col);
    puff(p, CX, 14, 14, 11, col);
    puff(p, 22, 50, 9, 10, col);
    puff(p, 74, 50, 9, 10, col);
    return;
  }
  if (girl) {
    puff(p, CX, 28, 22, 16, col);
    puff(p, 32, 34, 12, 13, col);
    puff(p, 64, 34, 12, 13, col);
    puff(p, 40, 20, 9, 8, col);
    puff(p, 56, 18, 9, 8, col);
    puff(p, CX, 16, 10, 8, hexMix(col, 20));
    if (style === "bob") {
      puff(p, 26, 52, 11, 13, col);
      puff(p, 70, 52, 11, 13, col);
      puff(p, 30, 64, 8, 8, col);
      puff(p, 66, 64, 8, 8, col);
    }
    if (style === "bun") {
      puff(p, CX, 14, 11, 10, col);
      puff(p, CX - 3, 10, 5, 4, hexMix(col, 36));
      puff(p, CX + 4, 12, 4, 4, hexMix(col, -20));
    }
    if (style === "pony") {
      box(p, 20, 36, 8, 5, hexMix(col, -44), 2);
    }
    if (style === "pigtails") {
      box(p, 14, 40, 7, 4, hexMix(col, -44), 2);
      box(p, 75, 40, 7, 4, hexMix(col, -44), 2);
    }
    return;
  }
  if (style === "mohawk") {
    puff(p, CX, 28, 7, 14, col);
    p.spike(CX, 4, 32, 6, col);
    puff(p, CX, 16, 5, 6, hexMix(col, 28));
    box(p, 45, 22, 6, 18, col, 1);
    return;
  }
  if (style === "spikes") {
    puff(p, CX, 32, 16, 10, col);
    p.spike(32, 8, 34, 4, col);
    p.spike(42, 4, 32, 5, col);
    p.spike(54, 4, 32, 5, col);
    p.spike(64, 8, 34, 4, col);
    puff(p, 42, 22, 5, 5, hexMix(col, 30));
    puff(p, 54, 20, 5, 5, hexMix(col, 24));
    return;
  }
  if (style === "undercut") {
    puff(p, CX, 28, 16, 11, col);
    puff(p, 40, 22, 8, 7, col);
    puff(p, 54, 20, 7, 7, hexMix(col, 28));
    box(p, 34, 36, 28, 3, hexMix(col, -50), 0);
    puff(p, 30, 40, 4, 6, hexMix(col, -30));
    puff(p, 66, 40, 4, 6, hexMix(col, -30));
    return;
  }
  if (style === "side") {
    puff(p, 36, 28, 16, 14, col);
    puff(p, 28, 32, 10, 12, col);
    puff(p, 42, 18, 8, 8, col);
    puff(p, 52, 30, 10, 10, col);
    puff(p, 62, 36, 8, 8, col);
    puff(p, 30, 22, 6, 6, hexMix(col, 32));
    return;
  }
  puff(p, CX, 28, 18, 13, col);
  puff(p, 34, 30, 11, 12, col);
  puff(p, 62, 32, 10, 11, col);
  puff(p, 40, 20, 8, 8, col);
  puff(p, 54, 18, 7, 8, col);
  puff(p, 48, 16, 8, 7, hexMix(col, 24));
  puff(p, 28, 40, 7, 8, col);
  puff(p, 68, 42, 6, 7, col);
  puff(p, 58, 24, 5, 5, hexMix(col, 36));
}

function bangs(p: Pix, style: string, col: string, girl: boolean, pose: Pose) {
  if (pose === "back") return;
  if (pose === "side") {
    puff(p, 54, 32, 9, 9, col);
    puff(p, 62, 36, 8, 8, col);
    puff(p, 50, 38, 7, 7, col);
    if (girl) {
      puff(p, 58, 40, 7, 7, col);
      puff(p, 48, 36, 6, 6, col);
    }
    return;
  }
  if (style === "mohawk") {
    puff(p, CX, 34, 6, 6, col);
    return;
  }
  if (style === "afro") {
    puff(p, 38, 32, 9, 8, col);
    puff(p, 48, 28, 10, 8, col);
    puff(p, 58, 32, 9, 8, col);
    puff(p, 34, 40, 6, 6, col);
    puff(p, 62, 40, 6, 6, col);
    return;
  }
  puff(p, 36, 40, 7, 7, col);
  puff(p, 46, 38, 7, 6, col);
  puff(p, 56, 40, 7, 7, col);
  if (girl || style === "messy" || style === "side") {
    puff(p, 32, 46, 5, 6, col);
    puff(p, 50, 42, 5, 5, hexMix(col, 28));
  }
  if (style === "side") {
    puff(p, 40, 44, 8, 6, col);
    puff(p, 28, 42, 6, 7, col);
  }
  if (girl && style === "bob") {
    puff(p, 40, 42, 8, 5, col);
    puff(p, 52, 42, 8, 5, col);
  }
}

function legs(p: Pix, skin: string, pose: Pose, walk: number, sit: boolean) {
  const a = walk ? 5 : 0;
  const b = walk ? -4 : 0;
  const h = sit ? 16 : 34;
  if (pose === "side") {
    cap(p, 46, 116 + a, 10, h, skin);
    cap(p, 50, 114 + b, 10, h, skin);
    return;
  }
  cap(p, 34, 116 + a, 11, h, skin);
  cap(p, 51, 114 + b, 11, h, skin);
}

function torsoSkin(p: Pix, skin: string, pose: Pose, girl: boolean, tank: boolean) {
  if (pose === "side") {
    box(p, 46, 68, 8, 12, skin, 3);
    if (tank) cap(p, 42, 74, 16, 40, skin);
    return;
  }
  box(p, 44, 68, 8, 12, skin, 3);
  oval(p, CX, 72, 5, 4, skin);
  if (tank) {
    const w = girl ? 24 : 26;
    box(p, CX - w / 2, 76, w, 40, skin, 4);
  }
}

function farArm(p: Pix, skin: string, pose: Pose, sleeve: "none" | "short" | "long") {
  if (sleeve === "long") return;
  const y0 = sleeve === "none" ? 80 : 98;
  const h = 128 - y0;
  if (pose === "side") return;
  cap(p, 22, y0, 10, h, skin);
}

function nearArm(p: Pix, skin: string, pose: Pose, sleeve: "none" | "short" | "long") {
  if (sleeve === "long") return;
  const y0 = sleeve === "none" ? 78 : 98;
  const h = 128 - y0;
  if (pose === "side") {
    cap(p, 40, y0, 10, h, skin);
    return;
  }
  cap(p, 64, y0, 11, h, skin);
}

function hands(p: Pix, skin: string, pose: Pose) {
  if (pose === "side") {
    puff(p, 45, 128, 6, 5.5, skin);
    return;
  }
  puff(p, 27, 128, 6.2, 5.4, skin);
  puff(p, 70, 126, 6.2, 5.4, skin);
  p.set(24, 130, mix(skin, -30));
  p.set(73, 128, mix(skin, -30));
}

function paintBot(p: Pix, name: string, col: string, girl: boolean, pose: Pose, walk: number, sit: boolean) {
  const a = walk ? 5 : 0;
  const b = walk ? -4 : 0;
  const short = name === "shorts";
  const skirt = girl && (name === "skirt" || name === "pleat");
  const h = sit ? 16 : short ? 22 : 36;

  if (pose === "side") {
    if (skirt) {
      for (let y = 112; y <= 138; y++) {
        const t = (y - 112) / 26;
        const w = Math.round(9 + t * 11);
        box(p, 50 - w, y, w + 7, 1, col, 0);
      }
      box(p, 42, 112, 16, 5, hexMix(col, -18), 1);
      if (name === "pleat") {
        ink(p, 48, 118, 1, 16);
        ink(p, 54, 118, 1, 16);
      }
      return;
    }
    cap(p, 44, 112 + a, 12, h, col);
    cap(p, 48, 110 + b, 12, h, col);
    box(p, 44, 112, 16, 7, col, 2);
    if (name === "jeans") p.rect(50, 118, 1, 20, mix(col, 40));
    if (name === "joggers") box(p, 44, 140, 16, 6, hexMix(col, -24), 2);
    if (name === "cargo") {
      box(p, 40, 126, 8, 10, hexMix(col, -18), 2);
      ink(p, 42, 128, 4, 1);
    }
    return;
  }

  if (skirt) {
    for (let y = 112; y <= 142; y++) {
      const t = (y - 112) / 30;
      const w = Math.round(14 + t * 15);
      box(p, CX - w, y, w * 2, 1, col, 0);
    }
    box(p, 36, 112, 24, 6, hexMix(col, -16), 2);
    oval(p, CX, 118, 7, 3, hexMix(col, 22));
    if (name === "pleat") {
      ink(p, 40, 118, 1, 20);
      ink(p, 48, 118, 1, 22);
      ink(p, 56, 118, 1, 20);
      p.rect(41, 118, 1, 20, mix(col, 40));
      p.rect(57, 118, 1, 20, mix(col, -40));
    }
    ink(p, 47, 114, 2, 2);
    return;
  }

  cap(p, 33, 112 + a, 13, h, col);
  cap(p, 50, 110 + b, 13, h, col);
  box(p, 34, 112, 28, 8, col, 3);
  box(p, 36, 112, 24, 4, hexMix(col, -20), 1);
  if (name === "jeans") {
    p.rect(40, 120, 2, 24, mix(col, 44));
    p.rect(54, 120, 2, 24, mix(col, 44));
    p.rect(38, 118, 4, 1, mix(col, 20));
    p.rect(54, 118, 4, 1, mix(col, 20));
    p.set(42, 122, mix(col, 70));
    p.set(55, 122, mix(col, 70));
  }
  if (name === "cargo") {
    box(p, 30, 126, 10, 12, hexMix(col, -16), 2);
    box(p, 56, 126, 10, 12, hexMix(col, -16), 2);
    box(p, 31, 126, 8, 4, hexMix(col, -28), 1);
    box(p, 57, 126, 8, 4, hexMix(col, -28), 1);
    ink(p, 33, 130, 4, 1);
    ink(p, 59, 130, 4, 1);
    p.set(36, 132, mix(col, 50));
    p.set(62, 132, mix(col, 50));
  }
  if (name === "joggers") {
    rib(p, 33, 142, 13, 5, col);
    rib(p, 50, 142, 13, 5, col);
    p.rect(35, 114, 8, 2, mix(col, 30));
  }
  if (name === "pants") {
    p.rect(46, 114, 4, 2, mix(col, -50));
    p.rect(39, 122, 1, 18, mix(col, -30));
    p.rect(56, 122, 1, 18, mix(col, 30));
  }
  if (short) {
    rib(p, 33, 130, 13, 3, col);
    rib(p, 50, 130, 13, 3, col);
    box(p, 32, 122, 8, 7, hexMix(col, -14), 2);
    box(p, 56, 122, 8, 7, hexMix(col, -14), 2);
  }
}

function paintTop(p: Pix, name: string, col: string, pose: Pose, girl: boolean) {
  const dark = hexMix(col, -22);
  const mark = contrast(col);
  const long = name !== "tee" && name !== "tank";
  const sleeveH = name === "tee" ? 20 : 50;

  if (pose === "side") {
    box(p, 42, 74, 18, 42, col, 6);
    oval(p, 51, 78, 8, 7, col);
    oval(p, 51, 114, 8, 6, col);
    if (name !== "tank") cap(p, 38, 78, 12, sleeveH, col);
    if (name === "tee") rib(p, 38, 96, 12, 3, col);
    if (long) rib(p, 38, 124, 12, 4, col);
    if (name === "hoodie") {
      box(p, 44, 68, 14, 12, col, 5);
      box(p, 46, 92, 10, 12, dark, 3);
      p.rect(51, 78, 2, 14, WHITE);
      puff(p, 52, 94, 2, 2, "#e8e0d0");
    }
    if (name === "sweater") rib(p, 44, 68, 14, 8, col);
    if (name === "jacket") {
      box(p, 50, 74, 6, 40, "#e8e2d6", 1);
      ink(p, 49, 76, 1, 36);
    }
    if (name === "tank") box(p, 50, 74, 5, 7, dark, 1);
    return;
  }

  const tw = girl ? 24 : 26;
  const x0 = CX - tw / 2;
  box(p, x0, 74, tw, 42, col, 6);
  oval(p, CX, 78, tw / 2 - 1, 8, col);
  oval(p, CX, 114, tw / 2 - 2, 7, col);

  if (name === "hoodie") {
    cap(p, 21, 78, 13, 50, col);
    cap(p, 62, 78, 13, 50, col);
    box(p, 38, 66, 20, 14, col, 6);
    oval(p, CX, 72, 10, 6, col);
    rib(p, 21, 124, 13, 4, col);
    rib(p, 62, 124, 13, 4, col);
    if (pose === "front") {
      oval(p, CX, 76, 9, 5, dark);
      box(p, 40, 92, 16, 12, dark, 4);
      ink(p, 43, 97, 10, 1);
      p.rect(43, 78, 2, 16, WHITE);
      p.rect(51, 78, 2, 16, WHITE);
      puff(p, 44, 96, 2.2, 2.4, "#e8e0d0");
      puff(p, 52, 96, 2.2, 2.4, "#e8e0d0");
    } else {
      puff(p, CX, 58, 16, 14, col);
      puff(p, CX, 50, 12, 10, dark);
    }
    return;
  }

  if (name === "tee") {
    cap(p, 22, 78, 13, 20, col);
    cap(p, 61, 78, 13, 20, col);
    oval(p, CX, 76, 8, 5, dark);
    rib(p, 22, 96, 13, 3, col);
    rib(p, 61, 96, 13, 3, col);
    if (pose === "front") {
      p.disc(CX, 92, 4.5, 4.5, mark);
      p.disc(CX, 92, 2.4, 2.4, rgb(col));
    }
    return;
  }

  if (name === "jacket") {
    cap(p, 20, 78, 13, 50, col);
    cap(p, 63, 78, 13, 50, col);
    rib(p, 20, 124, 13, 4, col);
    rib(p, 63, 124, 13, 4, col);
    if (pose === "front") {
      box(p, 45, 74, 6, 40, "#e8e2d6", 1);
      box(p, x0, 74, 10, 42, dark, 3);
      ink(p, 47, 76, 1, 38);
      p.rect(48, 76, 1, 38, mix("#e8e2d6", -50));
      for (let i = 0; i < 5; i++) p.set(48, 82 + i * 6, CREAM);
      box(p, 34, 98, 7, 8, dark, 2);
      box(p, 55, 98, 7, 8, dark, 2);
    } else {
      ink(p, CX, 80, 1, 32);
      box(p, 34, 98, 7, 8, dark, 2);
      box(p, 55, 98, 7, 8, dark, 2);
    }
    return;
  }

  if (name === "tank") {
    box(p, 36, 74, 5, 8, dark, 1);
    box(p, 55, 74, 5, 8, dark, 1);
    oval(p, CX, 80, 7, 5, hexMix(col, 16));
    ink(p, 37, 74, 4, 1);
    ink(p, 56, 74, 4, 1);
    return;
  }

  cap(p, 21, 78, 13, 50, col);
  cap(p, 62, 78, 13, 50, col);
  rib(p, 38, 66, 20, 8, col);
  if (pose === "front") {
    for (let i = 0; i < 4; i++) p.rect(38 + i * 5, 86, 2, 18, mix(col, i % 2 ? 28 : -28));
  }
  rib(p, 21, 124, 13, 4, col);
  rib(p, 62, 124, 13, 4, col);
}

function paintShoes(p: Pix, name: string, col: string, pose: Pose, walk: number, sit: boolean) {
  const a = walk ? 5 : 0;
  const b = walk ? -4 : 0;
  const lift = sit ? -12 : 0;
  const dark = hexMix(col, -28);

  if (pose === "side") {
    const y = 148 + lift + a;
    box(p, 44, y + 10, 26, 5, "#f4f4f6", 2);
    box(p, 46, y, 18, 12, col, 4);
    oval(p, 66, y + 6, 7, 6, col);
    oval(p, 48, y + 6, 5, 6, dark);
    if (name === "hightops" || name === "boots") box(p, 48, y - 12, 12, 14, col, 3);
    if (name === "boots") {
      box(p, 46, y - 16, 14, 18, col, 3);
      p.rect(50, y - 4, 8, 2, mix(col, 40));
    }
    if (name === "sneakers" || name === "hightops" || name === "skate") p.rect(52, y + 4, 10, 1, WHITE);
    if (name === "skate") p.rect(48, y + 8, 16, 2, WHITE);
    return;
  }

  const ly = 150 + a + lift;
  const ry = 148 + b + lift;

  if (name === "boots") {
    box(p, 32, 138 + a + lift, 14, 26, col, 3);
    box(p, 50, 136 + b + lift, 14, 26, col, 3);
    box(p, 32, 156 + a + lift, 14, 6, dark, 2);
    box(p, 50, 154 + b + lift, 14, 6, dark, 2);
    p.rect(35, 148 + a + lift, 8, 2, mix(col, 40));
    p.rect(53, 146 + b + lift, 8, 2, mix(col, 40));
    return;
  }
  if (name === "hightops") {
    box(p, 32, 142 + a + lift, 14, 22, col, 3);
    box(p, 50, 140 + b + lift, 14, 22, col, 3);
    box(p, 32, 158 + a + lift, 14, 6, "#f4f4f6", 2);
    box(p, 50, 156 + b + lift, 14, 6, "#f4f4f6", 2);
    ink(p, 34, 150 + a + lift, 9, 1);
    ink(p, 52, 148 + b + lift, 9, 1);
    for (let i = 0; i < 3; i++) {
      p.set(36 + i * 3, 148 + a + lift, WHITE);
      p.set(54 + i * 3, 146 + b + lift, WHITE);
    }
    return;
  }
  if (name === "slides" || name === "flats") {
    puff(p, 39, 158 + a + lift, 9, 6, col);
    puff(p, 57, 156 + b + lift, 9, 6, col);
    if (name === "slides") {
      box(p, 34, 154 + a + lift, 10, 3, dark, 1);
      box(p, 52, 152 + b + lift, 10, 3, dark, 1);
    }
    return;
  }
  box(p, 32, ly, 14, 16, col, 4);
  box(p, 50, ry, 14, 16, col, 4);
  box(p, 32, ly + 10, 14, 6, name === "skate" ? dark : "#f4f4f6", 2);
  box(p, 50, ry + 10, 14, 6, name === "skate" ? dark : "#f4f4f6", 2);
  ink(p, 34, ly + 5, 8, 1);
  ink(p, 52, ry + 5, 8, 1);
  p.rect(34, ly + 2, 6, 2, mix(col, 50));
  p.rect(52, ry + 2, 6, 2, mix(col, 50));
  if (name === "skate") {
    p.rect(33, ly + 7, 12, 2, WHITE);
    p.rect(51, ry + 7, 12, 2, WHITE);
  }
  p.rect(32, ly + 14, 14, 2, SOLE);
  p.rect(50, ry + 14, 14, 2, SOLE);
}

function paintPose(f: Figure, pose: Pose, walk: number, sit: boolean) {
  const girl = (f.gender ?? 0) === 1;
  const pal = palOf(f);
  const hairName = hairsFor(f.gender ?? 0)[f.hair] || defaultHairName(f.gender ?? 0);
  const topName = topsFor(f.gender ?? 0)[f.topCut ?? 0] || "hoodie";
  const botName = botsFor(f.gender ?? 0)[f.botCut ?? 0] || (girl ? "skirt" : "pants");
  const shoeName = shoesFor(f.gender ?? 0)[f.shoeCut ?? 0] || "sneakers";
  const sleeve = sleeveKind(topName);
  const p = new Pix(LOOK_W, LOOK_H);

  const hx = pose === "side" ? 52 : CX;
  const hy = 47;
  const hrx = pose === "side" ? 22 : 26;
  const hry = 28;

  hairBack(p, hairName, pal.hair, girl, pose);
  farArm(p, pal.skin, pose, sleeve);
  legs(p, pal.skin, pose, walk, sit);
  paintBot(p, botName, pal.bot, girl, pose, walk, sit);
  torsoSkin(p, pal.skin, pose, girl, topName === "tank");
  paintTop(p, topName, pal.top, pose, girl);
  nearArm(p, pal.skin, pose, sleeve);
  hands(p, pal.skin, pose);
  paintShoes(p, shoeName, pal.shoe, pose, walk, sit);
  headBall(p, hx, hy, hrx, hry, pal.skin);
  if (pose === "front") ear(p, pal.skin, 72, 52);
  if (pose === "side") ear(p, pal.skin, 38, 52);
  if (pose === "back") {
    ear(p, pal.skin, 24, 52);
    ear(p, pal.skin, 72, 52);
  }
  hairCap(p, hairName, pal.hair, girl, pose);
  punchFace(p, pal.skin, pose);
  bangs(p, hairName, pal.hair, girl, pose);
  if (pose === "front") faceFront(p, girl, pal.skin);
  if (pose === "side") faceSide(p, girl, pal.skin);
  p.outline(INK);
  return p;
}

export function paintLook(fig: Figure, opts: LookOpts = {}): Pix {
  const f = clampFigure(fig);
  const view = opts.view ?? (opts.back ? 2 : 1);
  const walk = opts.walk ?? 0;
  const sit = !!opts.sit;
  if (view === 0) return flipH(paintPose(f, "side", walk, sit));
  if (view === 2) return paintPose(f, "back", walk, sit);
  if (view === 3) return paintPose(f, "side", walk, sit);
  return paintPose(f, "front", walk, sit);
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
