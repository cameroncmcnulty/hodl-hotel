import type { Figure } from "../types";
import { mix } from "./pix";

export const SKIN = [
  "#ffe9dc",
  "#fbe0c8",
  "#f3d1b0",
  "#e8c19a",
  "#d4a574",
  "#c48a56",
  "#b56c3a",
  "#a05a32",
  "#8d4e24",
  "#7a4528",
  "#6b3a20",
  "#5a2e18",
  "#4a2414",
  "#3a1c10",
  "#29140c",
  "#1a0e08",
];
export const EYES = ["#3b2214", "#5c3317", "#8b5a2b", "#3d5c2e", "#2e5aa6", "#4a6274", "#b8860b", "#1a1a1a"];
export const FACE_BOY = ["oval"];
export const FACE_GIRL = ["oval"];
export const FACE = FACE_BOY;
export const EYE_LABEL = ["dark brown"];
export const HAIR_C = [
  "#704421",
  "#1b1b1b",
  "#c45c26",
  "#e8d07a",
  "#6b3fa0",
  "#14F195",
  "#ff6b5a",
  "#f5c542",
  "#2ec4b6",
  "#dfe7ff",
  "#f4e4d4",
  "#4a2c0a",
];
export const TOPS = ["#9a9a9a", "#ff6b5a", "#9945FF", "#14F195", "#2ec4b6", "#f5c542", "#ffffff", "#ff8fab", "#3b82f6", "#1a1a1e"];
export const BOTTOMS = ["#2a2a2a", "#1e3a5f", "#3b5cad", "#7c3aed", "#0f766e", "#9a3412", "#111111", "#f5c542"];
export const SHOES = ["#c41e3a", "#f4f4f6", "#1a1a1a", "#ff8fab", "#14F195", "#3b82f6", "#f5c542", "#6b3fa0"];
export const HAIR_BOY = ["short", "spike", "buzz", "mohawk"];
export const HAIR_GIRL = ["pony", "bob", "long"];
export const TOP_BOY = ["hoodie", "tee", "jacket"];
export const TOP_GIRL = ["hoodie", "cami", "cardi"];
export const BOT_BOY = ["pants", "shorts"];
export const BOT_GIRL = ["skirt", "shorts", "pants"];
export const SHOE_BOY = ["sneakers"];
export const SHOE_GIRL = ["sneakers"];
export const HAIR_STYLES = HAIR_BOY;
export const TOP_CUTS = TOP_BOY;
export const BOT_CUTS = BOT_GIRL;
export const ACC = ["none"];
export const GENDERS = ["boy", "girl"];

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
  return FACE_BOY;
}
export function defaultHairName(gender: number) {
  return gender === 1 ? "pony" : "short";
}

export const DEFAULT_FIGURE: Figure = {
  gender: 0,
  skin: 2,
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

export const AVATAR_DRAW_H = 128;
export const AVATAR_NAME_LIFT = 138;
export const SPRITE_W = 784;
export const SPRITE_H = 1168;

const sprites = new Map<string, HTMLCanvasElement>();
let loadPromise: Promise<void> | null = null;
const SPRITE_V = 22;
const inflight = new Map<string, Promise<HTMLCanvasElement | null>>();

export function clampFigure(f: Partial<Figure> | undefined): Figure {
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Number(v) || 0));
  const gender = n(f?.gender, GENDERS.length - 1);
  return {
    gender,
    skin: n(f?.skin, SKIN.length - 1),
    hair: n(f?.hair, hairsFor(gender).length - 1),
    hairColor: n(f?.hairColor, HAIR_C.length - 1),
    top: n(f?.top, TOPS.length - 1),
    bottom: n(f?.bottom, BOTTOMS.length - 1),
    shoes: n(f?.shoes, SHOES.length - 1),
    acc: 0,
    topCut: n(f?.topCut, topsFor(gender).length - 1),
    botCut: n(f?.botCut, botsFor(gender).length - 1),
    shoeCut: n(f?.shoeCut, shoesFor(gender).length - 1),
    eyes: 0,
    face: 0,
  };
}

function isMagenta(r: number, g: number, b: number) {
  if (r > 200 && b > 170 && g < 110) return true;
  return Math.hypot(r - 255, g - 0, b - 255) < 140 && g < 120;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function cacheCanvas(id: string, img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (isMagenta(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  sprites.set(id, c);
  return c;
}

export async function loadSpriteId(id: string) {
  if (sprites.has(id)) return sprites.get(id)!;
  const hit = inflight.get(id);
  if (hit) return hit;
  const p = (async () => {
    const img = await loadImage(`/art/avatars/${id}.png?v=${SPRITE_V}`);
    if (!img) return null;
    return cacheCanvas(id, img);
  })();
  inflight.set(id, p);
  return p;
}

function gKey(fig: Figure) {
  return fig.gender === 1 ? "f" : "m";
}
function viewOf(dir: 0 | 1 | 2 | 3) {
  return dir === 2 || dir === 3 ? "ne" : "se";
}
function flipOf(dir: 0 | 1 | 2 | 3) {
  return dir === 0 || dir === 3;
}
function hairName(fig: Figure) {
  return hairsFor(fig.gender ?? 0)[fig.hair] || defaultHairName(fig.gender ?? 0);
}
function topName(fig: Figure) {
  return topsFor(fig.gender ?? 0)[fig.topCut ?? 0] || "hoodie";
}
function botName(fig: Figure) {
  return botsFor(fig.gender ?? 0)[fig.botCut ?? 0] || (fig.gender === 1 ? "skirt" : "pants");
}
function shoeName(fig: Figure) {
  return shoesFor(fig.gender ?? 0)[fig.shoeCut ?? 0] || "sneakers";
}

export function lookSpriteIds(fig: Figure, dir: 0 | 1 | 2 | 3 = 1) {
  const f = clampFigure(fig);
  const g = gKey(f);
  const view = viewOf(dir);
  const hair = hairName(f);
  const top = topName(f);
  const bot = botName(f);
  const shoe = shoeName(f);
  return [
    `${g}-base-${view}`,
    `${g}-base-se`,
    `${g}-hair-${hair}-${view}-layer`,
    `${g}-hair-${hair}-se-layer`,
    `${g}-top-${top}-${view}-layer`,
    `${g}-top-${top}-se-layer`,
    `${g}-bot-${bot}-${view}-layer`,
    `${g}-bot-${bot}-se-layer`,
    `${g}-shoe-${shoe}-${view}-layer`,
    `${g}-shoe-${shoe}-se-layer`,
    `${g}-se-idle`,
  ];
}

export async function loadLookSprites(fig: Figure, dir: 0 | 1 | 2 | 3 = 1) {
  await Promise.all(lookSpriteIds(fig, dir).map(loadSpriteId));
}

export function loadAvatars() {
  if (!loadPromise) {
    loadPromise = Promise.all(
      [
        "m-base-se",
        "f-base-se",
        "m-base-ne",
        "f-base-ne",
        "m-hair-short-se-layer",
        "m-top-hoodie-se-layer",
        "m-bot-pants-se-layer",
        "m-shoe-sneakers-se-layer",
        "f-hair-pony-se-layer",
        "f-top-hoodie-se-layer",
        "f-bot-skirt-se-layer",
        "f-shoe-sneakers-se-layer",
        "m-se-idle",
        "f-se-idle",
      ].map(loadSpriteId)
    ).then(() => undefined);
  }
  return loadPromise;
}

export function lookReady(fig: Figure, dir: 0 | 1 | 2 | 3 = 1) {
  const f = clampFigure(fig);
  const g = gKey(f);
  const view = viewOf(dir);
  const hair = hairName(f);
  const top = topName(f);
  const bot = botName(f);
  const shoe = shoeName(f);
  return !!(
    (sprites.get(`${g}-base-${view}`) || sprites.get(`${g}-base-se`)) &&
    (sprites.get(`${g}-hair-${hair}-${view}-layer`) || sprites.get(`${g}-hair-${hair}-se-layer`)) &&
    (sprites.get(`${g}-top-${top}-${view}-layer`) || sprites.get(`${g}-top-${top}-se-layer`)) &&
    (sprites.get(`${g}-bot-${bot}-${view}-layer`) || sprites.get(`${g}-bot-${bot}-se-layer`)) &&
    (sprites.get(`${g}-shoe-${shoe}-${view}-layer`) || sprites.get(`${g}-shoe-${shoe}-se-layer`))
  );
}

export function avatarsReady() {
  return sprites.size > 0;
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lum(r: number, g: number, b: number) {
  return (r * 0.32 + g * 0.5 + b * 0.18) / 255;
}

function tintPixel(r: number, g: number, b: number, target: [number, number, number]): [number, number, number] {
  const L = Math.max(0.08, lum(r, g, b));
  const tL = Math.max(0.08, lum(target[0], target[1], target[2]));
  const k = L / tL;
  return [
    Math.max(0, Math.min(255, Math.round(target[0] * k))),
    Math.max(0, Math.min(255, Math.round(target[1] * k))),
    Math.max(0, Math.min(255, Math.round(target[2] * k))),
  ];
}

function isSkinPx(r: number, g: number, b: number) {
  return r > 180 && g > 110 && g < 230 && b > 80 && b < 200 && r - b > 30 && r > g - 4;
}

function tintLayer(src: HTMLCanvasElement, hex: string) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const d = data.data;
  const t = hexRgb(hex);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    if (r < 28 && g < 28 && b < 28) continue;
    const n = tintPixel(r, g, b, t);
    d[i] = n[0];
    d[i + 1] = n[1];
    d[i + 2] = n[2];
  }
  ctx.putImageData(data, 0, 0);
  return out;
}

function mapSkin(src: HTMLCanvasElement, hex: string) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const d = data.data;
  const t = hexRgb(hex);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    if (!isSkinPx(r, g, b)) continue;
    const n = tintPixel(r, g, b, t);
    d[i] = n[0];
    d[i + 1] = n[1];
    d[i + 2] = n[2];
  }
  ctx.putImageData(data, 0, 0);
  return out;
}

function firstSpr(ids: string[]) {
  for (const id of ids) {
    const s = sprites.get(id);
    if (s) return s;
  }
  return null;
}

function stamp(dst: HTMLCanvasElement, src: HTMLCanvasElement | null) {
  if (!src) return;
  const dctx = dst.getContext("2d")!;
  dctx.drawImage(src, 0, 0);
}

const composeCache = new Map<string, HTMLCanvasElement>();

function compose(fig: Figure, dir: 0 | 1 | 2 | 3) {
  const g = gKey(fig);
  const view = viewOf(dir);
  const hair = hairName(fig);
  const top = topName(fig);
  const bot = botName(fig);
  const shoe = shoeName(fig);
  const base = firstSpr([`${g}-base-${view}`, `${g}-base-se`]);
  const hairL = firstSpr([`${g}-hair-${hair}-${view}-layer`, `${g}-hair-${hair}-se-layer`]);
  const topL = firstSpr([`${g}-top-${top}-${view}-layer`, `${g}-top-${top}-se-layer`]);
  const botL = firstSpr([`${g}-bot-${bot}-${view}-layer`, `${g}-bot-${bot}-se-layer`]);
  const shoeL = firstSpr([`${g}-shoe-${shoe}-${view}-layer`, `${g}-shoe-${shoe}-se-layer`]);
  if (base && hairL && topL && botL && shoeL) {
    const key = `n1|${g}|${view}|${hair}|${top}|${bot}|${shoe}|${fig.skin}|${fig.hairColor}|${fig.top}|${fig.bottom}|${fig.shoes}`;
    const hit = composeCache.get(key);
    if (hit) return hit;
    const out = document.createElement("canvas");
    out.width = base.width;
    out.height = base.height;
    stamp(out, mapSkin(base, SKIN[fig.skin] || SKIN[0]));
    stamp(out, tintLayer(shoeL, SHOES[fig.shoes] || SHOES[0]));
    stamp(out, tintLayer(botL, BOTTOMS[fig.bottom] || BOTTOMS[0]));
    stamp(out, tintLayer(topL, TOPS[fig.top] || TOPS[0]));
    stamp(out, tintLayer(hairL, HAIR_C[fig.hairColor] || HAIR_C[0]));
    composeCache.set(key, out);
    if (composeCache.size > 180) {
      const first = composeCache.keys().next().value;
      if (first) composeCache.delete(first);
    }
    return out;
  }
  return firstSpr([`${g}-se-idle`, `${g}-ne-idle`, "m-se-idle", "f-se-idle"]);
}

function blit(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, dx: number, dy: number, dw: number, dh: number, flip: boolean) {
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

export function drawAvatarFront(ctx: CanvasRenderingContext2D, fig: Figure, cx: number, cy: number, scale = 4, dir: 0 | 1 | 2 | 3 = 0) {
  const f = clampFigure(fig);
  const made = compose(f, dir);
  const destH = Math.max(120, Math.round(36 * scale));
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const dx = Math.round(cx - destW / 2);
  const dy = Math.round(cy - destH * 0.92);
  if (!made) return;
  blit(ctx, made, dx, dy, destW, destH, flipOf(dir));
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
  const f = clampFigure(fig);
  const walking = !!opts.walking;
  const dance = !!opts.dance;
  const sit = !!opts.sit && !walking;
  const frame = dance ? Math.floor(t * 8) % 4 : walking ? Math.floor((opts.dist || 0) * 2) % 2 : 0;
  const made = compose(f, dir);
  const destH = sit ? AVATAR_DRAW_H - 14 : AVATAR_DRAW_H;
  const destW = Math.round((destH * SPRITE_W) / SPRITE_H);
  const bob = dance ? (frame % 2 === 0 ? -3 : 0) : walking ? (frame % 2 === 0 ? 0 : -4) : 0;
  const dx = Math.round(sx - destW / 2);
  const dy = Math.round(sy - destH + 12 + bob + (sit ? 10 : 0));
  if (!made) return;
  blit(ctx, made, dx, dy, destW, destH, flipOf(dir));
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
