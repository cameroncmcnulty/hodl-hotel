import { CATALOG, furn } from "../catalog";
import { paintFurn } from "./furnDraw";

export const SPRITE_SRC: Record<string, string> = Object.fromEntries(
  CATALOG.filter((f) => f.id !== "ad_board").map((f) => [f.id, `/art/furn/${f.id}.png`])
);

/** Only the hot-pink backdrop. Leaves mint, teal, purple, coral, gold furniture alone. */
function isHotMagenta(r: number, g: number, b: number) {
  if (g > 110) return false;
  if (r < 210 || b < 170) return false;
  if (Math.abs(r - b) > 70) return false;
  return true;
}

function isInk(r: number, g: number, b: number) {
  return r < 45 && g < 45 && b < 50;
}

export function keyAndTrim(img: HTMLImageElement | HTMLCanvasElement) {
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
  const tryKey = (x: number, y: number, test: (r: number, g: number, b: number) => boolean) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (keyed[i]) return;
    const o = i * 4;
    if (d[o + 3] < 8) {
      keyed[i] = 1;
      return;
    }
    if (!test(d[o], d[o + 1], d[o + 2])) return;
    keyed[i] = 1;
    d[o + 3] = 0;
    stack.push(i);
  };
  const flood = (test: (r: number, g: number, b: number) => boolean, seeds: number[]) => {
    stack.length = 0;
    for (const i of seeds) {
      tryKey(i % w, (i / w) | 0, test);
    }
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % w;
      const y = (i / w) | 0;
      tryKey(x - 1, y, test);
      tryKey(x + 1, y, test);
      tryKey(x, y - 1, test);
      tryKey(x, y + 1, test);
    }
  };
  const edgeSeeds: number[] = [];
  for (let x = 0; x < w; x++) {
    edgeSeeds.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    edgeSeeds.push(y * w, y * w + (w - 1));
  }
  flood(isHotMagenta, edgeSeeds);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 8 && isHotMagenta(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
  }
  for (let pass = 0; pass < 5; pass++) {
    const marks: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        if (d[o + 3] < 12) continue;
        if (!isInk(d[o], d[o + 1], d[o + 2])) continue;
        let colorN = 0;
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const p = (ny * w + nx) * 4;
          if (d[p + 3] < 12) continue;
          if (!isInk(d[p], d[p + 1], d[p + 2])) colorN++;
        }
        if (!colorN) marks.push(o);
      }
    }
    if (!marks.length) break;
    for (const o of marks) d[o + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);

  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return c;
  const pad = 1;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
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
    const png = await loadImage(`/art/furn/${id}.png?v=27`);
    const img = png || (await loadImage(`/art/furn/${id}.jpg?v=27`));
    if (!img) {
      const def = furn(id);
      if (!def) return null;
      const baked = paintFurn(def, 0);
      if (baked.width > 4) cache[id] = baked;
      return baked.width > 4 ? baked : null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    cache[id] = canvas;
    return canvas;
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
