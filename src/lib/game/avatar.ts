import type { Figure } from "../types";
import { mix } from "./pix";
import {
  allChibiIds,
  chibiIds,
  hasChibi,
  LOOK_H,
  LOOK_SCALE,
  LOOK_W,
  lookKey,
  paintLook,
  pixFromRgba,
  setChibi,
  type LookOpts,
} from "./lookDraw";

export {
  ACC,
  allChibiIds,
  BOT_BOY,
  BOT_CUTS,
  BOT_GIRL,
  BOTTOMS,
  chibiIds,
  COLOR_N,
  DEFAULT_FIGURE,
  GENDERS,
  HAIR_BOY,
  HAIR_C,
  HAIR_COLOR_N,
  HAIR_GIRL,
  HAIR_STYLES,
  hasChibi,
  LOOK_N,
  premadeId,
  SHOE_BOY,
  SHOE_GIRL,
  SHOES,
  SKIN,
  SKIN_N,
  TOP_BOY,
  TOP_CUTS,
  TOP_GIRL,
  TOPS,
  botColors,
  botsFor,
  clampFigure,
  defaultHairName,
  facesFor,
  hairColors,
  hairsFor,
  LOOK_H,
  LOOK_SCALE,
  LOOK_W,
  lookKey,
  paintLook,
  setChibi,
  shoeColors,
  shoesFor,
  topColors,
  topsFor,
} from "./lookDraw";

export const AVATAR_DRAW_H = LOOK_H * LOOK_SCALE;
export const AVATAR_NAME_LIFT = AVATAR_DRAW_H - 8;
export const SPRITE_W = LOOK_W;
export const SPRITE_H = LOOK_H;
export const SPRITE_V = 40;

const canvasCache = new Map<string, HTMLCanvasElement>();
const inflight = new Map<string, Promise<void>>();
let allLoading: Promise<void> | null = null;
let allLoaded = false;

function lookCanvas(fig: Figure, opts: LookOpts = {}) {
  const key = lookKey(fig, opts);
  const hit = canvasCache.get(key);
  if (hit) return hit;
  const c = paintLook(fig, opts).canvas();
  canvasCache.set(key, c);
  if (canvasCache.size > 220) {
    const first = canvasCache.keys().next().value;
    if (first) canvasCache.delete(first);
  }
  return c;
}

export function clearLookCache() {
  canvasCache.clear();
}

export function loadSpriteId(id: string) {
  if (hasChibi(id)) return Promise.resolve();
  const hit = inflight.get(id);
  if (hit) return hit;
  const p = (async () => {
    try {
      const img = new Image();
      img.src = `/art/premade/${id}.png?v=30`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      setChibi(id, pixFromRgba(img.width, img.height, data.data));
      canvasCache.clear();
    } catch {
      /* missing color variant falls back to -0 */
    }
  })();
  inflight.set(id, p);
  return p;
}

export function lookSpriteIds(fig: Figure, _dir: 0 | 1 | 2 | 3 = 1) {
  return chibiIds(fig);
}

export async function loadLookSprites(fig: Figure, _dir: 0 | 1 | 2 | 3 = 1) {
  await Promise.all(chibiIds(fig).map(loadSpriteId));
}

export function loadAvatars() {
  if (allLoaded) return Promise.resolve();
  if (allLoading) return allLoading;
  allLoading = Promise.all(allChibiIds().map(loadSpriteId)).then(() => {
    allLoaded = true;
  });
  return allLoading;
}

export function lookReady(_fig?: Figure, _dir: 0 | 1 | 2 | 3 = 1) {
  return allLoaded;
}

export function avatarsReady() {
  return allLoaded;
}

function blit(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  dx: number,
  dy: number,
  scale: number,
  flip: boolean
) {
  const dw = src.width * scale;
  const dh = src.height * scale;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.save();
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(src, dx, dy, dw, dh);
  }
}

export function drawAvatarFront(
  ctx: CanvasRenderingContext2D,
  fig: Figure,
  cx: number,
  cy: number,
  scale = 4,
  dir: 0 | 1 | 2 | 3 = 1
) {
  const s = Math.max(1, Math.round(scale));
  const src = lookCanvas(fig, { view: dir });
  const dw = src.width * s;
  const dh = src.height * s;
  blit(ctx, src, Math.round(cx - dw / 2), Math.round(cy - dh), s, false);
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
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 2) % 2 : 0;
  const walk: 0 | 1 = walking && frame % 2 === 1 ? 1 : 0;
  const src = lookCanvas(fig, { view: dir, walk, sit });
  const s = LOOK_SCALE;
  const bob = dance ? (frame % 2 === 0 ? -3 : 0) : walking ? (frame % 2 === 0 ? 0 : -3) : 0;
  const dw = src.width * s;
  const dh = src.height * s;
  const dy = Math.round(sy - dh + 8 + bob + (sit ? 12 : 0));
  blit(ctx, src, Math.round(sx - dw / 2), dy, s, false);
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
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  poly(topPts, top);
  poly(leftPts, left);
  poly(rightPts, right);
}
