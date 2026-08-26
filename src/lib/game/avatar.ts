import type { Figure } from "../types";
import { mix, Pix, rgb } from "./pix";

export const SKIN = ["#fbe0c8", "#f0c3a0", "#d29b6b", "#a86b3c", "#6e4320", "#3d2614"];
export const HAIR_C = ["#1b1b1b", "#4a2c0a", "#c45c26", "#e8d07a", "#6b3fa0", "#14F195", "#ff6b5a", "#f5c542", "#2ec4b6", "#dfe7ff"];
export const TOPS = ["#ff6b5a", "#9945FF", "#14F195", "#2ec4b6", "#f5c542", "#24143d", "#ffffff", "#ff8fab", "#3b82f6", "#111111"];
export const BOTTOMS = ["#24143d", "#1e3a5f", "#4b5563", "#7c3aed", "#0f766e", "#9a3412", "#111111", "#f5c542"];
export const SHOES = ["#111111", "#ffffff", "#9945FF", "#ff6b5a", "#2ec4b6", "#f5c542"];
export const HAIR_STYLES = ["buzz", "tuft", "bob", "spike", "curl", "cap", "long", "mohawk", "pony", "bun", "fluff", "band"];
export const TOP_CUTS = ["tee", "hoodie", "vest", "tank", "sweater", "shirt"];
export const BOT_CUTS = ["pants", "shorts", "skirt", "cargo"];
export const ACC = ["none", "glasses", "shades", "headphones", "scarf", "pack", "visor", "bow"];

export const DEFAULT_FIGURE: Figure = {
  skin: 1,
  hair: 2,
  hairColor: 1,
  top: 1,
  bottom: 0,
  shoes: 0,
  acc: 0,
  topCut: 0,
  botCut: 0,
};

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  return {
    skin: n(f?.skin, SKIN.length - 1),
    hair: n(f?.hair, HAIR_STYLES.length - 1),
    hairColor: n(f?.hairColor, HAIR_C.length - 1),
    top: n(f?.top, TOPS.length - 1),
    bottom: n(f?.bottom, BOTTOMS.length - 1),
    shoes: n(f?.shoes, SHOES.length - 1),
    acc: n(f?.acc, ACC.length - 1),
    topCut: n(f?.topCut, TOP_CUTS.length - 1),
    botCut: n(f?.botCut, BOT_CUTS.length - 1),
  };
}

/** Native doll size: ~Habbo proportions, 3/4 at 45°. Scaled up with nearest-neighbor. */
const W = 32;
const H = 52;
const cache = new Map<string, HTMLCanvasElement>();

function hairCap(p: Pix, hx: number, hy: number, col: string, extra = 0) {
  p.disc(hx, hy - 2, 8 + extra, 7 + extra, rgb(col));
  p.rect(hx - 6, hy - 8, 13, 4, mix(col, 22));
}

function hairBack(p: Pix, hx: number, hy: number, style: number, col: string, back: boolean) {
  const c = rgb(col);
  const d = mix(col, -40);
  const lit = mix(col, 24);
  if (style === 0) {
    hairCap(p, hx, hy, col);
  } else if (style === 1) {
    hairCap(p, hx, hy, col, 1);
    p.rect(hx - 4, hy - 11, 9, 4, c);
    p.rect(hx - 2, hy - 12, 5, 2, lit);
  } else if (style === 2) {
    hairCap(p, hx, hy, col, 1);
    p.disc(hx - 8, hy + 2, 4, 6, c);
    p.disc(hx + 8, hy + 1, 4, 7, c);
    p.rect(hx - 7, hy - 9, 15, 4, lit);
  } else if (style === 3) {
    hairCap(p, hx, hy, col);
    for (const [ox, oy, hh] of [
      [-5, -12, 6],
      [-2, -14, 8],
      [1, -15, 8],
      [4, -13, 7],
    ] as [number, number, number][]) {
      p.rect(hx + ox, hy + oy, 2, hh, c);
      p.set(hx + ox + 1, hy + oy, lit);
    }
  } else if (style === 4) {
    p.disc(hx - 6, hy - 4, 5, 5, c);
    p.disc(hx + 6, hy - 5, 5, 5, c);
    p.disc(hx, hy - 8, 5, 5, c);
    hairCap(p, hx, hy, col);
  } else if (style === 5) {
    p.block(hx - 8, hy - 8, 17, 8, col);
    p.rect(hx - 5, hy - 12, 11, 5, d);
    p.rect(hx - 4, hy - 13, 9, 2, lit);
    hairCap(p, hx, hy + 1, col);
  } else if (style === 6) {
    hairCap(p, hx, hy, col, 1);
    p.block(hx - 9, hy + 1, 4, 14, col);
    p.block(hx + 6, hy + 1, 4, 15, col);
    p.rect(hx - 9, hy + 13, 4, 3, d);
    p.rect(hx + 6, hy + 14, 4, 3, d);
  } else if (style === 7) {
    hairCap(p, hx, hy, col);
    p.block(hx - 2, hy - 16, 5, 12, col);
    p.rect(hx - 1, hy - 17, 3, 2, lit);
  } else if (style === 8) {
    hairCap(p, hx, hy, col);
    if (back) {
      p.block(hx - 1, hy + 6, 3, 11, col);
      p.disc(hx, hy + 16, 3, 3, c);
    } else {
      p.block(hx + 8, hy + 1, 3, 12, col);
      p.disc(hx + 9, hy + 13, 3, 3, c);
    }
  } else if (style === 9) {
    hairCap(p, hx, hy, col);
    const bx = back ? hx : hx + 7;
    p.disc(bx, hy - 10, 4, 4, c);
    p.disc(bx, hy - 11, 3, 3, d);
  } else if (style === 10) {
    hairCap(p, hx, hy, col, 2);
    p.rect(hx - 9, hy - 3, 3, 6, c);
    p.rect(hx + 7, hy - 4, 3, 6, c);
    p.rect(hx - 6, hy - 10, 13, 4, lit);
  } else {
    hairCap(p, hx, hy, col);
    p.block(hx - 8, hy - 5, 17, 4, col);
    p.rect(hx - 7, hy - 6, 15, 2, d);
  }
}

function hairFront(p: Pix, hx: number, hy: number, style: number, col: string, back: boolean) {
  if (back) return;
  const c = rgb(col);
  if (style === 1 || style === 2 || style === 4 || style === 10) {
    p.rect(hx - 5, hy - 6, 11, 3, c);
    p.rect(hx - 4, hy - 4, 4, 3, mix(col, -28));
  }
  if (style === 6) {
    p.rect(hx - 6, hy - 5, 5, 4, c);
    p.rect(hx + 2, hy - 5, 5, 4, c);
  }
  if (style === 0 || style === 8 || style === 9) p.rect(hx - 4, hy - 7, 9, 2, c);
}

function paintDoll(fig: Figure, back: boolean, frame: number, sit: boolean, dance: boolean) {
  const p = new Pix(W, H);
  const skin = SKIN[fig.skin];
  const hair = HAIR_C[fig.hairColor];
  const top = TOPS[fig.top];
  const botc = BOTTOMS[fig.bottom];
  const shoe = SHOES[fig.shoes];
  const cut = fig.topCut ?? 0;
  const bcut = fig.botCut ?? 0;
  const hx = 16;
  const hy = 14;
  const bob = dance ? (frame % 2 === 0 ? -2 : 0) : 0;
  const walk = frame % 4;
  const farK = walk === 1 ? 2 : walk === 3 ? -1 : 0;
  const nearK = walk === 3 ? 2 : walk === 1 ? -1 : 0;

  hairBack(p, hx, hy + bob, fig.hair, hair, back);

  p.discShade(hx, hy + bob, 8, 9, skin);
  p.rect(hx - 5, hy + 4 + bob, 11, 5, rgb(skin));
  p.rect(hx - 4, hy + 6 + bob, 9, 3, mix(skin, -18));
  p.rect(hx - 9, hy + 1 + bob, 3, 4, rgb(skin));
  p.rect(hx + 7, hy + 1 + bob, 3, 4, rgb(skin));
  p.rect(hx - 9, hy + 2 + bob, 2, 2, mix(skin, -22));

  hairFront(p, hx, hy + bob, fig.hair, hair, back);

  if (!back) {
    p.rect(hx - 4, hy - 3 + bob, 3, 1, mix(skin, -50));
    p.rect(hx + 2, hy - 3 + bob, 3, 1, mix(skin, -50));
    p.rect(hx - 3, hy - 1 + bob, 3, 3, [250, 250, 252]);
    p.rect(hx + 3, hy - 1 + bob, 3, 3, [250, 250, 252]);
    p.rect(hx - 2, hy + bob, 2, 2, [22, 14, 24]);
    p.rect(hx + 4, hy + bob, 2, 2, [22, 14, 24]);
    p.set(hx + 5, hy - 1 + bob, [255, 255, 255]);
    p.rect(hx - 4, hy + 3 + bob, 2, 1, mix(skin, 20));
    p.rect(hx + 4, hy + 3 + bob, 2, 1, mix(skin, 20));
    p.rect(hx, hy + 5 + bob, 3, 1, mix(skin, -38));
    if (fig.acc === 1) {
      p.rect(hx - 5, hy - 2 + bob, 5, 4, [30, 30, 34]);
      p.rect(hx + 2, hy - 2 + bob, 5, 4, [30, 30, 34]);
      p.rect(hx - 4, hy - 1 + bob, 3, 2, [170, 215, 230]);
      p.rect(hx + 3, hy - 1 + bob, 3, 2, [170, 215, 230]);
    }
    if (fig.acc === 2) p.block(hx - 8, hy - 2 + bob, 17, 3, "#111111");
  }
  if (fig.acc === 3) {
    p.disc(hx - 9, hy + bob, 3, 3, [40, 40, 44]);
    p.disc(hx + 9, hy + bob, 3, 3, [40, 40, 44]);
  }
  if (fig.acc === 6) p.block(hx - 8, hy - 6 + bob, 17, 3, "#14F195");
  if (fig.acc === 7) p.disc(hx + 8, hy - 8 + bob, 3, 3, rgb("#ff6b5a"));

  p.block(hx - 1, 23 + bob, 3, 3, skin);

  const armY = 26 + bob + (dance ? -3 : 0);
  p.block(hx - 10, armY, 3, 10, skin);
  p.rect(hx - 10, armY + 9, 3, 2, mix(skin, -18));

  const ty = 25 + bob;
  if (cut === 1) {
    p.block(hx - 7, ty - 1, 15, 12, top);
    p.rect(hx - 2, ty + 2, 2, 5, [242, 242, 245]);
    p.rect(hx + 2, ty + 2, 2, 5, [242, 242, 245]);
    p.disc(hx, hy + 7 + bob, 7, 4, rgb(top));
    p.rect(hx - 6, ty - 1, 13, 3, mix(top, 22));
  } else if (cut === 2) {
    p.block(hx - 6, ty, 13, 11, top);
    p.rect(hx - 4, ty + 2, 9, 7, [246, 246, 248]);
    p.block(hx - 7, ty - 1, 4, 11, top);
    p.block(hx + 4, ty - 1, 4, 11, top);
  } else if (cut === 3) {
    p.block(hx - 6, ty + 2, 13, 9, top);
    p.rect(hx - 7, ty, 3, 5, rgb(skin));
    p.rect(hx + 5, ty, 3, 5, rgb(skin));
    p.rect(hx - 5, ty + 2, 11, 2, mix(top, 24));
  } else if (cut === 4) {
    p.block(hx - 8, ty - 1, 17, 13, top);
    p.rect(hx - 7, ty, 15, 3, mix(top, 20));
  } else if (cut === 5) {
    p.block(hx - 6, ty, 13, 11, top);
    p.rect(hx - 1, ty + 3, 4, 2, mix(top, -36));
    p.rect(hx - 5, ty, 11, 2, mix(top, 18));
  } else {
    p.block(hx - 6, ty, 13, 11, top);
    p.rect(hx - 5, ty, 11, 3, mix(top, 26));
    p.block(hx - 10, armY + 1, 4, 4, top);
    p.block(hx + 7, armY + 1, 4, 4, top);
  }

  p.block(hx + 7, armY + 1, 3, 10, skin);
  p.rect(hx + 7, armY + 10, 3, 2, mix(skin, -18));

  if (fig.acc === 4) p.block(hx - 5, ty - 1, 11, 4, "#ff6b5a");
  if (fig.acc === 5) p.block(hx - 4, ty + 3, 9, 7, "#3d2a18");

  const hip = 36 + bob;
  const farX = 11 + (sit ? 0 : farK);
  const nearX = 16 + (sit ? 0 : nearK);
  const legH = sit ? 6 : 10;
  if (bcut === 2) {
    p.block(hx - 6, hip, 13, 7, botc);
    p.rect(hx - 5, hip, 11, 2, mix(botc, 20));
    p.block(farX, hip + 6, 4, sit ? 3 : 5, skin);
    p.block(nearX, hip + 7, 4, sit ? 3 : 5, skin);
  } else if (bcut === 1) {
    p.block(farX, hip, 5, 6, botc);
    p.block(nearX, hip + 1, 5, 6, botc);
    p.block(farX, hip + 6, 4, 5, skin);
    p.block(nearX, hip + 7, 4, 5, skin);
  } else if (bcut === 3) {
    p.block(farX, hip, 5, legH, botc);
    p.block(nearX, hip + 1, 5, legH, botc);
    p.rect(farX, hip + 4, 5, 1, mix(botc, -30));
    p.rect(nearX, hip + 5, 5, 1, mix(botc, -30));
  } else {
    p.block(farX, hip, 5, legH, botc);
    p.block(nearX, hip + 1, 5, legH, botc);
    p.rect(farX + 1, hip, 3, 3, mix(botc, 18));
    p.rect(nearX + 1, hip + 1, 3, 3, mix(botc, 18));
  }

  const shoeY = sit ? 46 + bob : 46 + bob;
  p.block(farX + farK, shoeY, 6, 4, shoe);
  p.block(nearX + nearK, shoeY + 1, 6, 4, shoe);
  p.rect(farX + 1 + farK, shoeY, 4, 1, mix(shoe, 32));
  p.rect(nearX + 1 + nearK, shoeY + 1, 4, 1, mix(shoe, 32));

  p.outline([16, 10, 22]);
  return p;
}

function raster(fig: Figure, dir: 0 | 1 | 2 | 3, frame: number, sit: boolean, dance: boolean) {
  const f = clampFigure(fig);
  const key = `${f.skin}.${f.hair}.${f.hairColor}.${f.top}.${f.bottom}.${f.shoes}.${f.acc}.${f.topCut}.${f.botCut}.${dir}.${frame}.${sit}.${dance}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const back = dir === 2 || dir === 3;
  const pix = paintDoll(f, back, frame, sit, dance);
  const src = pix.canvas();
  const flip = dir === 1 || dir === 2;
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0);
  cache.set(key, out);
  if (cache.size > 400) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return out;
}

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 4) {
  const spr = raster(fig, 0, 0, false, false);
  const s = Math.max(3, Math.round(scale));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr, Math.round(cx - (W * s) / 2), Math.round(cy - H * s * 0.72), W * s, H * s);
}

export type AvatarDrawOpts = { dance?: boolean; walking?: boolean; sit?: boolean; dist?: number };

export function drawAvatarIso(
  ctx: CanvasRenderingContext2D,
  fig: Figure,
  sx: number,
  sy: number,
  dir: 0 | 1 | 2 | 3,
  t: number,
  opts: AvatarDrawOpts = {}
) {
  const walking = !!opts.walking;
  const dance = !!opts.dance;
  const sit = !!opts.sit && !walking;
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 4) % 4 : 0;
  const spr = raster(fig, dir, frame, sit, dance);
  const scale = 2;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr, Math.round(sx - (W * scale) / 2), Math.round(sy - H * scale + 16), W * scale, H * scale);
}

export function shade(hex: string, amt: number) {
  const [r, g, b] = mix(hex, amt);
  return `rgb(${r},${g},${b})`;
}

export function isoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  top: string,
  left: string,
  right: string
) {
  const tw = w;
  const td = d;
  const topPts = [
    [x, y - h],
    [x + tw, y - h + tw * 0.5],
    [x + tw - td, y - h + (tw + td) * 0.5],
    [x - td, y - h + td * 0.5],
  ];
  const leftPts = [
    [x, y - h],
    [x - td, y - h + td * 0.5],
    [x - td, y + td * 0.5],
    [x, y],
  ];
  const rightPts = [
    [x, y - h],
    [x + tw, y - h + tw * 0.5],
    [x + tw, y + tw * 0.5],
    [x, y],
  ];
  const poly = (pts: number[][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  poly(topPts, top);
  poly(leftPts, left);
  poly(rightPts, right);
}
