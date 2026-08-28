import { CATALOG } from "../catalog";

export const SPRITE_SRC: Record<string, string> = Object.fromEntries(
  CATALOG.filter((f) => f.id !== "ad_board").map((f) => [f.id, `/art/furn/${f.id}.png`])
);

function isMagenta(r: number, g: number, b: number) {
  const dist = Math.hypot(r - 255, g - 0, b - 255);
  if (dist < 155) return true;
  if (r > 155 && b > 150 && g < 145 && Math.abs(r - b) < 95) return true;
  if (r > 190 && b > 140 && g < 175 && r + b > g * 2.15) return true;
  return false;
}

function keyAndTrim(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  const w = c.width;
  const h = c.height;
  const keyed = new Uint8Array(w * h);
  const stack: number[] = [];
  const tryKey = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (keyed[i]) return;
    const o = i * 4;
    if (d[o + 3] < 8) {
      keyed[i] = 1;
      return;
    }
    if (!isMagenta(d[o], d[o + 1], d[o + 2])) return;
    keyed[i] = 1;
    d[o + 3] = 0;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) {
    tryKey(x, 0);
    tryKey(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryKey(0, y);
    tryKey(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i / w) | 0;
    tryKey(x - 1, y);
    tryKey(x + 1, y);
    tryKey(x, y - 1);
    tryKey(x, y + 1);
  }
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 8 && isMagenta(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);

  const trimmed = ctx.getImageData(0, 0, c.width, c.height);
  const td = trimmed.data;
  let minX = c.width,
    minY = c.height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (td[i + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return c;
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(c.width - 1, maxX + pad);
  maxY = Math.min(c.height - 1, maxY + pad);
  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext("2d")!.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const cache: Record<string, HTMLCanvasElement> = {};
const inflight: Record<string, Promise<HTMLCanvasElement | null>> = {};

export function loadSprite(id: string) {
  if (cache[id]) return Promise.resolve(cache[id]);
  if (id in inflight) return inflight[id];
  inflight[id] = (async () => {
    const png = await loadImage(`/art/furn/${id}.png?v=15`);
    const img = png || (await loadImage(`/art/furn/${id}.jpg?v=15`));
    if (!img) return null;
    const canvas = keyAndTrim(img);
    if (canvas.width > 4) cache[id] = canvas;
    return canvas.width > 4 ? canvas : null;
  })();
  return inflight[id];
}

export async function loadSprites(ids?: string[]) {
  const list = ids ? ids.filter(Boolean) : Object.keys(SPRITE_SRC);
  await Promise.all(list.map((id) => loadSprite(id)));
  return cache;
}

export function spriteCache() {
  return cache;
}
