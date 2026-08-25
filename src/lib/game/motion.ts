import { dirTowards } from "./path";

/** Classic hotel-sim pace: about one tile every third of a second, interpolated. */
export const TILE_MS = 330;

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
  m.pathKey = key;
  m.queue = path.filter((p) => Math.hypot(p.x - from.x, p.y - from.y) > 0.02);
  if (m.queue.length) m.moving = true;
}

export function tickMot(m: Mot, dt: number) {
  if (!m.queue.length) {
    m.moving = false;
    return;
  }
  m.moving = true;
  const t = m.queue[0];
  const dx = t.x - m.x;
  const dy = t.y - m.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.03) {
    m.x = t.x;
    m.y = t.y;
    m.dir = dirTowards(m.x - dx, m.y - dy, t.x, t.y);
    m.queue.shift();
    if (!m.queue.length) {
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
}
