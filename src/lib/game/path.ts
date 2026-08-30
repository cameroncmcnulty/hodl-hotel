import { isStair, layoutById, tileH, walkable } from "../layouts";
import type { Placed } from "../types";
import { furn, footprint } from "../catalog";

export function furnAt(furniture: Placed[], x: number, y: number) {
  for (let i = furniture.length - 1; i >= 0; i--) {
    const p = furniture[i];
    const def = furn(p.catalogId);
    if (!def) continue;
    const { w, d } = footprint(def, p.rot);
    if (x >= p.x && x < p.x + w && y >= p.y && y < p.y + d) return p;
  }
  return undefined;
}

export function wallFace(layoutId: string, x: number, y: number): "n" | "w" | null {
  const layout = layoutById(layoutId);
  if (!walkable(layout, x, y)) return null;
  const onBack = !walkable(layout, x, y - 1);
  const onLeft = !walkable(layout, x - 1, y);
  if (onLeft && !onBack) return "w";
  if (onBack) return "n";
  if (onLeft) return "w";
  return null;
}

/** North wall keeps rot 0 (along X). West wall snaps to rot 1 (along Y). */
export function wallAutoRot(layoutId: string, x: number, y: number): 0 | 1 | 2 | 3 {
  return wallFace(layoutId, x, y) === "w" ? 1 : 0;
}

export function canPlaceFurn(
  room: { layoutId: string; furniture: Placed[] },
  defId: string,
  x: number,
  y: number,
  rot: 0 | 1 | 2 | 3
) {
  const def = furn(defId);
  if (!def) return false;
  const layout = layoutById(room.layoutId);
  const { w, d } = footprint(def, rot);
  for (let dy = 0; dy < d; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (!walkable(layout, x + dx, y + dy) && def.slot === "floor") return false;
      if (isStair(layout, x + dx, y + dy) && def.slot === "floor" && !def.walkable) return false;
    }
  }
  if (def.walkable) return true;
  if (def.slot === "wall") {
    if (!walkable(layout, x, y)) return false;
    const onBack = !walkable(layout, x, y - 1);
    const onLeft = !walkable(layout, x - 1, y);
    return onBack || onLeft;
  }
  const blocked = blockedSet(room.layoutId, room.furniture);
  for (let dy = 0; dy < d; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (blocked.has(`${x + dx},${y + dy}`)) return false;
    }
  }
  return true;
}

export function blockedSet(layoutId: string, furniture: Placed[], ignoreWalkable = true) {
  const layout = layoutById(layoutId);
  const blocked = new Set<string>();
  for (let y = 0; y < layout.h; y++) {
    for (let x = 0; x < layout.w; x++) {
      if (!walkable(layout, x, y)) blocked.add(`${x},${y}`);
    }
  }
  for (const p of furniture) {
    const def = furn(p.catalogId);
    if (!def) continue;
    if (ignoreWalkable && (def.walkable || def.slot === "wall")) continue;
    const { w, d } = footprint(def, p.rot);
    for (let dy = 0; dy < d; dy++) {
      for (let dx = 0; dx < w; dx++) blocked.add(`${p.x + dx},${p.y + dy}`);
    }
  }
  return blocked;
}

export function astar(
  layoutId: string,
  furniture: Placed[],
  sx: number,
  sy: number,
  tx: number,
  ty: number
) {
  const layout = layoutById(layoutId);
  const blocked = blockedSet(layoutId, furniture);
  const key = (x: number, y: number) => `${x},${y}`;
  const start = key(sx, sy);
  const goal = key(tx, ty);
  const goalSeat = furnAt(furniture, tx, ty);
  const sitGoal = !!(goalSeat && furn(goalSeat.catalogId)?.sittable);
  if (blocked.has(goal) && goal !== start && !sitGoal) return [] as { x: number; y: number }[];
  const open = new Set([start]);
  const came = new Map<string, string>();
  const g = new Map<string, number>([[start, 0]]);
  const h = (x: number, y: number) => Math.abs(x - tx) + Math.abs(y - ty);
  const f = new Map<string, number>([[start, h(sx, sy)]]);

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (open.size) {
    let cur = "";
    let best = Infinity;
    for (const k of open) {
      const fv = f.get(k) ?? Infinity;
      if (fv < best) {
        best = fv;
        cur = k;
      }
    }
    if (cur === goal) {
      const path: { x: number; y: number }[] = [];
      let c = cur;
      while (c !== start) {
        const [x, y] = c.split(",").map(Number);
        path.push({ x, y });
        c = came.get(c)!;
      }
      return path.reverse();
    }
    open.delete(cur);
    const [cx, cy] = cur.split(",").map(Number);
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= layout.w || ny >= layout.h) continue;
      const nk = key(nx, ny);
      if (blocked.has(nk) && nk !== goal && nk !== start) continue;
      const h1 = tileH(layout, cx, cy);
      const h2 = tileH(layout, nx, ny);
      const stepOk =
        Math.abs(h1 - h2) < 0.2 ||
        ((isStair(layout, cx, cy) || isStair(layout, nx, ny)) && Math.abs(h1 - h2) <= 0.75);
      if (!stepOk) continue;
      const ng = (g.get(cur) ?? 0) + 1;
      if (ng < (g.get(nk) ?? Infinity)) {
        came.set(nk, cur);
        g.set(nk, ng);
        f.set(nk, ng + h(nx, ny));
        open.add(nk);
      }
    }
  }
  return [] as { x: number; y: number }[];
}

export function dirTowards(x: number, y: number, nx: number, ny: number): 0 | 1 | 2 | 3 {
  const dx = nx - x;
  const dy = ny - y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 0 : 2;
  return dy > 0 ? 1 : 3;
}
