import { dirTowards } from "./path";

/** One tile in ~280ms so a full walk0/walk1 step plays. */
export const TILE_MS = 280;

export type Mot = {
  x: number;
  y: number;
  dir: 0 | 1 | 2 | 3;
  queue: { x: number; y: number }[];
  moving: boolean;
  dist: number;
  pathKey: string;
};

export function motAt(x: number, y: number, dir: 0 | 1 | 2 | 3 = 0): Mot {
  return { x, y, dir, queue: [], moving: false, dist: 0, pathKey: "" };
}

export function setPath(m: Mot, path: { x: number; y: number }[], from = { x: m.x, y: m.y }) {
  const key = path.map((p) => `${p.x},${p.y}`).join(">");
  if (key === m.pathKey && m.queue.length) return;
  let start = 0;
  let best = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = Math.hypot(path[i].x - from.x, path[i].y - from.y);
    if (d < best) {
      best = d;
      start = i;
    }
  }
  if (best < 0.18 && start < path.length - 1) start += 1;
  m.pathKey = key;
  m.queue = path.slice(start).filter((p) => Math.hypot(p.x - from.x, p.y - from.y) > 0.04);
  if (m.queue.length) {
    m.moving = true;
    m.dir = dirTowards(from.x, from.y, m.queue[0].x, m.queue[0].y);
  }
}

export function face(m: Mot, x: number, y: number) {
  m.dir = dirTowards(m.x, m.y, x, y);
}

export function tickMot(m: Mot, dt: number) {
  if (!m.queue.length) {
    m.moving = false;
    m.x = Math.round(m.x * 1000) / 1000;
    m.y = Math.round(m.y * 1000) / 1000;
    if (Math.abs(m.x - Math.round(m.x)) < 0.04) m.x = Math.round(m.x);
    if (Math.abs(m.y - Math.round(m.y)) < 0.04) m.y = Math.round(m.y);
    return;
  }
  m.moving = true;
  const t = m.queue[0];
  const dx = t.x - m.x;
  const dy = t.y - m.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.04) {
    m.x = t.x;
    m.y = t.y;
    m.queue.shift();
    if (m.queue.length) {
      m.dir = dirTowards(m.x, m.y, m.queue[0].x, m.queue[0].y);
    } else {
      m.moving = false;
      m.pathKey = "";
    }
    return;
  }
  m.dir = dirTowards(m.x, m.y, t.x, t.y);
  const take = Math.min(len, dt / TILE_MS);
  m.x += (dx / len) * take;
  m.y += (dy / len) * take;
  m.dist += take;
  if (m.queue.length) m.dir = dirTowards(m.x, m.y, m.queue[0].x, m.queue[0].y);
}
