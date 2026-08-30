import type { Figure } from "../types";
import { mix } from "./pix";
import { LOOK_H, LOOK_SCALE, LOOK_W, lookKey, paintLook, paintThumb, type LookOpts, type ThumbZone } from "./lookDraw";

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
  DYE,
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
  figureString,
  hairColors,
  hairsFor,
  hatColors,
  hatsFor,
  HATS,
  ITEM_LABEL,
  LOOK_H,
  LOOK_SCALE,
  LOOK_W,
  lookKey,
  paintLook,
  paintThumb,
  setChibi,
  shoeColors,
  shoesFor,
  THUMB_BOX,
  topColors,
  topsFor,
  type ThumbZone,
} from "./lookDraw";

export const AVATAR_TILE_W = 40;
export const AVATAR_DRAW_H = 64;
export const AVATAR_NAME_LIFT = 60;
export const SPRITE_W = LOOK_W;
export const SPRITE_H = LOOK_H;
export const SPRITE_V = 40;

type LookCache = { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number };
const canvasCache = new Map<string, LookCache>();

function contentBox(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 10) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX) return { x: 0, y: 0, w: c.width, h: c.height };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function lookCached(fig: Figure, opts: LookOpts = {}): LookCache {
  const key = lookKey(fig, opts);
  const hit = canvasCache.get(key);
  if (hit) return hit;
  const canvas = paintLook(fig, opts).canvas();
  const box = contentBox(canvas);
  const rec = { canvas, ...box };
  canvasCache.set(key, rec);
  if (canvasCache.size > 220) {
    const first = canvasCache.keys().next().value;
    if (first) canvasCache.delete(first);
  }
  return rec;
}

function lookCanvas(fig: Figure, opts: LookOpts = {}) {
  return lookCached(fig, opts).canvas;
}

export function clearLookCache() {
  canvasCache.clear();
}

export function loadSpriteId(_id: string) {
  return Promise.resolve();
}

export function lookSpriteIds(_fig: Figure, _dir: 0 | 1 | 2 | 3 = 1) {
  return [] as string[];
}

export async function loadLookSprites(_fig: Figure, _dir: 0 | 1 | 2 | 3 = 1) {
  return;
}

export function loadAvatars() {
  return Promise.resolve();
}

export function lookReady(_fig?: Figure, _dir: 0 | 1 | 2 | 3 = 1) {
  return true;
}

export function avatarsReady() {
  return true;
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

export function drawLookThumb(
  ctx: CanvasRenderingContext2D,
  fig: Figure,
  zone: ThumbZone,
  dx: number,
  dy: number,
  scale = 1
) {
  const s = Math.max(1, Math.round(scale));
  const src = paintThumb(fig, zone).canvas();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, dx, dy, src.width * s, src.height * s);
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
  const rec = lookCached(fig, { view: dir, walk, sit });
  const bob = dance ? (frame % 2 === 0 ? -2 : 0) : walking ? (frame % 2 === 0 ? 0 : -2) : 0;
  const dw = AVATAR_TILE_W;
  const dh = Math.max(24, Math.round((dw * rec.h) / Math.max(1, rec.w)));
  const dx = Math.round(sx - dw / 2);
  const dy = Math.round(sy - dh + bob + (sit ? Math.round(dh * 0.16) : 0));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(rec.canvas, rec.x, rec.y, rec.w, rec.h, dx, dy, dw, dh);
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
