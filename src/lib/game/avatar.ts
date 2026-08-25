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

const W = 33;
const H = 56;
const cache = new Map<string, HTMLCanvasElement>();

function hairBack(p: Pix, hx: number, hy: number, style: number, col: string, back: boolean) {
  const c = rgb(col);
  const d = mix(col, -40);
  if (style === 0) {
    p.disc(hx, hy - 1, 9, 8, c);
  } else if (style === 1) {
    p.disc(hx, hy - 2, 10, 9, c);
    p.rect(hx - 4, hy - 12, 8, 3, c);
  } else if (style === 2) {
    p.disc(hx, hy - 1, 11, 10, c);
    p.disc(hx - 9, hy + 2, 5, 7, c);
    p.disc(hx + 9, hy + 2, 5, 7, c);
  } else if (style === 3) {
    p.disc(hx, hy - 1, 10, 8, c);
    for (const [ox, oy] of [
      [-6, -12],
      [-2, -14],
      [2, -15],
      [6, -13],
      [0, -11],
    ])
      p.rect(hx + ox, hy + oy, 3, 6, c);
  } else if (style === 4) {
    p.disc(hx - 7, hy - 4, 6, 6, c);
    p.disc(hx + 7, hy - 4, 6, 6, c);
    p.disc(hx, hy - 8, 6, 6, c);
    p.disc(hx, hy - 1, 10, 8, c);
  } else if (style === 5) {
    p.rect(hx - 10, hy - 8, 21, 8, c);
    p.rect(hx - 6, hy - 12, 13, 5, d);
    p.disc(hx, hy - 3, 10, 6, c);
  } else if (style === 6) {
    p.disc(hx, hy - 1, 11, 9, c);
    p.rect(hx - 11, hy, 5, 16, c);
    p.rect(hx + 7, hy, 5, 16, c);
  } else if (style === 7) {
    p.disc(hx, hy - 1, 9, 7, c);
    p.rect(hx - 3, hy - 18, 7, 14, c);
    p.rect(hx - 2, hy - 20, 5, 3, d);
  } else if (style === 8) {
    p.disc(hx, hy - 1, 10, 8, c);
    if (back) p.disc(hx, hy + 8, 4, 6, c);
    else p.disc(hx + 10, hy + 4, 4, 8, c);
  } else if (style === 9) {
    p.disc(hx, hy - 1, 10, 8, c);
    p.disc(hx + (back ? 0 : 8), hy - 10, 5, 5, c);
    p.disc(hx + (back ? 0 : 8), hy - 12, 4, 4, d);
  } else if (style === 10) {
    p.disc(hx, hy - 2, 12, 10, c);
    p.rect(hx - 12, hy - 4, 4, 8, c);
    p.rect(hx + 9, hy - 4, 4, 8, c);
  } else {
    p.disc(hx, hy - 1, 10, 8, c);
    p.rect(hx - 10, hy - 4, 21, 4, d);
  }
}

function hairFront(p: Pix, hx: number, hy: number, style: number, col: string, back: boolean) {
  if (back) return;
  const c = rgb(col);
  const d = mix(col, -35);
  if (style === 1 || style === 2 || style === 10) {
    p.rect(hx - 7, hy - 6, 14, 3, c);
    p.rect(hx - 6, hy - 4, 4, 3, d);
  }
  if (style === 6) {
    p.rect(hx - 8, hy - 5, 6, 4, c);
    p.rect(hx + 2, hy - 5, 6, 4, c);
  }
  if (style === 8) p.rect(hx - 5, hy - 5, 10, 3, c);
}

function paintDoll(
  fig: Figure,
  back: boolean,
  frame: number,
  sit: boolean,
  dance: boolean
) {
  const p = new Pix(W, H);
  const skin = SKIN[fig.skin];
  const hair = HAIR_C[fig.hairColor];
  const top = TOPS[fig.top];
  const bot = BOTTOMS[fig.bottom];
  const shoe = SHOES[fig.shoes];
  const cut = fig.topCut ?? 0;
  const bcut = fig.botCut ?? 0;
  const hx = 16;
  const hy = 16;
  const bob = dance ? (frame % 2 === 0 ? -2 : 0) : 0;
  const walk = frame % 4;
  const lStep = walk === 1 ? 2 : walk === 3 ? -1 : 0;
  const rStep = walk === 3 ? 2 : walk === 1 ? -1 : 0;

  hairBack(p, hx, hy + bob, fig.hair, hair, back);

  p.discShade(hx, hy + bob, 9, 10, skin);
  p.rect(hx - 10, hy + 1 + bob, 3, 5, rgb(skin));
  p.rect(hx + 8, hy + 1 + bob, 3, 5, rgb(skin));
  p.rect(hx - 10, hy + 2 + bob, 2, 3, mix(skin, -25));

  hairFront(p, hx, hy + bob, fig.hair, hair, back);

  if (!back) {
    p.rect(hx - 5, hy - 3 + bob, 3, 1, mix(skin, -50));
    p.rect(hx + 2, hy - 3 + bob, 3, 1, mix(skin, -50));
    p.rect(hx - 4, hy - 1 + bob, 3, 3, [250, 250, 250]);
    p.rect(hx + 2, hy - 1 + bob, 3, 3, [250, 250, 250]);
    p.rect(hx - 3, hy + bob, 2, 2, [20, 14, 24]);
    p.rect(hx + 3, hy + bob, 2, 2, [20, 14, 24]);
    p.rect(hx + 4, hy - 1 + bob, 1, 1, [255, 255, 255]);
    p.rect(hx - 1, hy + 5 + bob, 3, 1, mix(skin, -40));
    p.rect(hx - 5, hy + 3 + bob, 2, 1, mix(skin, 18));
    p.rect(hx + 4, hy + 3 + bob, 2, 1, mix(skin, 18));
    if (fig.acc === 1) {
      p.rect(hx - 5, hy - 2 + bob, 5, 4, [30, 30, 30]);
      p.rect(hx + 1, hy - 2 + bob, 5, 4, [30, 30, 30]);
      p.rect(hx - 4, hy - 1 + bob, 3, 2, [180, 220, 230]);
      p.rect(hx + 2, hy - 1 + bob, 3, 2, [180, 220, 230]);
    }
    if (fig.acc === 2) p.rect(hx - 8, hy - 2 + bob, 17, 3, [20, 20, 20]);
  }
  if (fig.acc === 3) {
    p.disc(hx - 10, hy - 2 + bob, 3, 3, [40, 40, 40]);
    p.disc(hx + 10, hy - 2 + bob, 3, 3, [40, 40, 40]);
  }
  if (fig.acc === 6) p.rect(hx - 8, hy - 6 + bob, 17, 3, rgb("#14F195"));
  if (fig.acc === 7) p.disc(hx + 8, hy - 8 + bob, 3, 3, rgb("#ff6b5a"));

  const ty = 27 + bob;
  p.rect(hx - 2, 25 + bob, 4, 3, rgb(skin));

  const armY = ty + (dance ? -3 : 2);
  p.rect(hx - 12, armY, 4, 11, rgb(skin));
  p.rect(hx + 8, armY, 4, 11, rgb(skin));
  p.rect(hx - 12, armY + 10, 4, 2, mix(skin, -20));
  p.rect(hx + 8, armY + 10, 4, 2, mix(skin, -20));

  if (cut === 1) {
    p.rect(hx - 9, ty - 1, 18, 13, rgb(top));
    p.rect(hx - 8, ty - 1, 16, 4, mix(top, 24));
    p.rect(hx - 3, ty + 2, 2, 5, [240, 240, 240]);
    p.rect(hx + 1, ty + 2, 2, 5, [240, 240, 240]);
    p.disc(hx, hy + 6 + bob, 8, 4, rgb(top));
  } else if (cut === 2) {
    p.rect(hx - 8, ty + 1, 16, 11, rgb(top));
    p.rect(hx - 6, ty + 2, 12, 8, [245, 245, 245]);
    p.rect(hx - 8, ty - 1, 5, 12, rgb(top));
    p.rect(hx + 3, ty - 1, 5, 12, rgb(top));
  } else if (cut === 3) {
    p.rect(hx - 7, ty + 2, 14, 10, rgb(top));
    p.rect(hx - 8, ty, 3, 5, rgb(skin));
    p.rect(hx + 5, ty, 3, 5, rgb(skin));
    p.rect(hx - 7, ty + 1, 14, 3, mix(top, 20));
  } else if (cut === 4) {
    p.rect(hx - 9, ty - 1, 18, 14, rgb(top));
    p.rect(hx - 8, ty, 16, 3, mix(top, 22));
  } else if (cut === 5) {
    p.rect(hx - 8, ty, 16, 12, rgb(top));
    p.rect(hx - 3, ty + 3, 6, 2, mix(top, -40));
  } else {
    p.rect(hx - 8, ty, 16, 12, rgb(top));
    p.rect(hx - 7, ty, 14, 3, mix(top, 26));
    p.rect(hx - 12, ty + 1, 5, 5, rgb(top));
    p.rect(hx + 7, ty + 1, 5, 5, rgb(top));
  }

  if (fig.acc === 4) p.rect(hx - 6, ty - 1, 12, 4, rgb("#ff6b5a"));
  if (fig.acc === 5) p.rect(hx - 5, ty + 4, 10, 8, mix("#24143d", 10));

  const ly = sit ? 38 + bob : 39 + bob;
  if (bcut === 2) {
    p.rect(hx - 8, ly, 16, 8, rgb(bot));
    p.rect(hx - 7, ly, 14, 3, mix(bot, 20));
    p.rect(hx - 6, ly + 8, 5, sit ? 4 : 7, rgb(skin));
    p.rect(hx + 1, ly + 8, 5, sit ? 4 : 7, rgb(skin));
  } else if (bcut === 1) {
    p.rect(hx - 7, ly, 6, 7, rgb(bot));
    p.rect(hx + 1, ly, 6, 7, rgb(bot));
    p.rect(hx - 6, ly + 7, 5, sit ? 3 : 6, rgb(skin));
    p.rect(hx + 1, ly + 7, 5, sit ? 3 : 6, rgb(skin));
  } else if (bcut === 3) {
    p.rect(hx - 8, ly, 7, sit ? 8 : 12, rgb(bot));
    p.rect(hx + 1, ly, 7, sit ? 8 : 12, rgb(bot));
    p.rect(hx - 8, ly + 4, 7, 2, mix(bot, -30));
    p.rect(hx + 1, ly + 4, 7, 2, mix(bot, -30));
  } else {
    p.rect(hx - 7, ly, 6, sit ? 8 : 13, rgb(bot));
    p.rect(hx + 1, ly, 6, sit ? 8 : 13, rgb(bot));
    p.rect(hx - 6, ly, 5, 3, mix(bot, 18));
    p.rect(hx + 2, ly, 5, 3, mix(bot, 18));
  }

  const sy = sit ? 48 + bob : 51 + bob;
  p.rect(hx - 7 + (sit ? 0 : lStep), sy, 6, 4, rgb(shoe));
  p.rect(hx + 1 + (sit ? 0 : rStep), sy, 6, 4, rgb(shoe));
  p.rect(hx - 7 + (sit ? 0 : lStep), sy, 6, 1, mix(shoe, 30));
  p.rect(hx + 1 + (sit ? 0 : rStep), sy, 6, 1, mix(shoe, 30));

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

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 1) {
  const spr = raster(fig, 0, 0, false, false);
  const s = Math.max(1, Math.round(scale * 2.2));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr, Math.round(cx - (W * s) / 2), Math.round(cy - H * s * 0.62), W * s, H * s);
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
