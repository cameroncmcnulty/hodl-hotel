import type { FurnDef } from "../catalog";
import { furn, footprint } from "../catalog";
import type { Ad, Occupant, Placed, Room } from "../types";
import { layoutById, isDance, isOutdoor, isStair, isWater, tileH, walkable } from "../layouts";
import { iso, TW, TH, ZH } from "./iso";
import type { Layout } from "../layouts";
import { AVATAR_NAME_LIFT, drawAvatarIso, shade } from "./avatar";

function snap(n: number) {
  return Math.round(n);
}

export type Cam = { x: number; y: number; z?: number };

export function tileAt(cam: Cam, mx: number, my: number, layout?: Layout, view?: { w: number; h: number }) {
  const z = cam.z && cam.z > 0 ? cam.z : 1;
  const cx = view?.w ? view.w / 2 : 0;
  const cy = view?.h ? view.h / 2 : 0;
  const sx = (mx - cx) / z + cx - cam.x;
  const sy = (my - cy) / z + cy - cam.y;
  if (!layout) {
    const x = (sx / (TW / 2) + sy / (TH / 2)) / 2;
    const y = (sy / (TH / 2) - sx / (TW / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }
  let best = { x: 0, y: 0 };
  let bestD = Infinity;
  for (let y = 0; y < layout.h; y++) {
    for (let x = 0; x < layout.w; x++) {
      if (!walkable(layout, x, y) && !isWater(layout, x, y)) continue;
      const p = iso(x + 0.5, y + 0.5, tileH(layout, x, y));
      const d = (p.sx - sx) * (p.sx - sx) + (p.sy - sy) * (p.sy - sy);
      if (d < bestD) {
        bestD = d;
        best = { x, y };
      }
    }
  }
  return best;
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string, stroke = "#2a1810", z = 0) {
  const p = iso(x, y, z);
  const t = { x: snap(p.sx), y: snap(p.sy) };
  const r = { x: snap(p.sx + TW / 2), y: snap(p.sy + TH / 2) };
  const b = { x: snap(p.sx), y: snap(p.sy + TH) };
  const l = { x: snap(p.sx - TW / 2), y: snap(p.sy + TH / 2) };
  ctx.beginPath();
  ctx.moveTo(t.x, t.y);
  ctx.lineTo(r.x, r.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(l.x, l.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + 1);
  ctx.lineTo(l.x + 1, l.y);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + 1);
  ctx.lineTo(r.x - 1, r.y);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.stroke();
}

const EDGE = 12;

function floorDrop(ctx: CanvasRenderingContext2D, x: number, y: number, east: boolean, south: boolean, dark: string, mid: string, z = 0) {
  const p = iso(x, y, z);
  const r = { sx: snap(p.sx + TW / 2), sy: snap(p.sy + TH / 2) };
  const b = { sx: snap(p.sx), sy: snap(p.sy + TH) };
  const l = { sx: snap(p.sx - TW / 2), sy: snap(p.sy + TH / 2) };
  if (east) {
    poly(ctx, [r, b, { sx: b.sx, sy: b.sy + EDGE }, { sx: r.sx, sy: r.sy + EDGE }], dark);
  }
  if (south) {
    poly(ctx, [l, b, { sx: b.sx, sy: b.sy + EDGE }, { sx: l.sx, sy: l.sy + EDGE }], mid);
  }
}

function cube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  top: string,
  left: string,
  right: string
) {
  const a = iso(x, y + d, z + h);
  const b = iso(x + w, y + d, z + h);
  const c = iso(x + w, y, z + h);
  const e = iso(x, y, z + h);
  const a2 = iso(x, y + d, z);
  const b2 = iso(x + w, y + d, z);
  const c2 = iso(x + w, y, z);
  poly(ctx, [e, c, c2, iso(x, y, z)], right);
  poly(ctx, [e, a, a2, iso(x, y, z)], left);
  poly(ctx, [e, b, c, a], top);
  void b2;
}

function poly(ctx: CanvasRenderingContext2D, pts: { sx: number; sy: number }[], fill: string, stroke = true) {
  ctx.beginPath();
  ctx.moveTo(snap(pts[0].sx), snap(pts[0].sy));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(snap(pts[i].sx), snap(pts[i].sy));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = "rgba(20,10,30,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const WALL_H = 7.4;

type WallTheme = { h: number; paper: string; cap: string; base: string; rail: string };

function wallTheme(layout: Layout): WallTheme {
  if (!layout.indoor) return { h: 1.45, paper: "#d9a07c", cap: "#f3d2b8", base: "#8a5340", rail: "#c48a6a" };
  if (layout.id === "grand_lobby") return { h: 7.6, paper: layout.paper || "#f3e0c4", cap: "#e0c068", base: "#7a4e28", rail: "#d4b45a" };
  if (layout.id === "shill_club") return { h: 7.9, paper: "#3b1860", cap: "#ff4fd8", base: "#14F195", rail: "#45f0ff" };
  if (layout.id === "cook_lab") return { h: 7.3, paper: "#f3ead8", cap: "#d4a84b", base: "#2a6b6b", rail: "#3d8f8f" };
  if (layout.id === "pixel_arcade") return { h: 7.7, paper: "#3b1d6e", cap: "#c084fc", base: "#22d3ee", rail: "#4ade80" };
  return { h: WALL_H, paper: layout.paper || "#e6d7bc", cap: "#d4b45a", base: "#7a4e28", rail: shade(layout.paper || "#e6d7bc", -12) };
}

function wallRunN(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, z: number, theme: WallTheme) {
  const top = z + theme.h;
  poly(ctx, [iso(x0, y, top), iso(x1 + 1, y, top), iso(x1 + 1, y, z), iso(x0, y, z)], theme.paper, false);
  poly(ctx, [iso(x0, y, top), iso(x1 + 1, y, top), iso(x1 + 1, y, top - 0.35), iso(x0, y, top - 0.35)], theme.cap, false);
  poly(ctx, [iso(x0, y, z + 0.42), iso(x1 + 1, y, z + 0.42), iso(x1 + 1, y, z), iso(x0, y, z)], theme.base, false);
  const mid = z + theme.h * 0.55;
  poly(ctx, [iso(x0, y, mid), iso(x1 + 1, y, mid), iso(x1 + 1, y, mid - 0.08), iso(x0, y, mid - 0.08)], theme.rail, false);
}

function wallRunW(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, z: number, theme: WallTheme) {
  const top = z + theme.h;
  const left = shade(theme.paper, -22);
  poly(ctx, [iso(x, y0, top), iso(x, y1 + 1, top), iso(x, y1 + 1, z), iso(x, y0, z)], left, false);
  poly(ctx, [iso(x, y0, top), iso(x, y1 + 1, top), iso(x, y1 + 1, top - 0.35), iso(x, y0, top - 0.35)], shade(theme.cap, -12), false);
  poly(ctx, [iso(x, y0, z + 0.42), iso(x, y1 + 1, z + 0.42), iso(x, y1 + 1, z), iso(x, y0, z)], shade(theme.base, -14), false);
  const mid = z + theme.h * 0.55;
  poly(ctx, [iso(x, y0, mid), iso(x, y1 + 1, mid), iso(x, y1 + 1, mid - 0.08), iso(x, y0, mid - 0.08)], shade(theme.rail, -18), false);
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  spr: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  d: number,
  z = 0,
  h = 1,
  wall = false,
  flip = false
) {
  ctx.imageSmoothingEnabled = false;
  const destW = Math.max(8, (w + d) * (TW / 2));
  const aspectH = destW * (spr.height / Math.max(1, spr.width));
  const destH = Math.max(12, h < 0.2 ? aspectH : Math.max(aspectH, h * ZH * 1.8));
  if (wall) {
    const hang = iso(x + w * 0.5, y + 0.08, z + 2.15);
    const wallW = Math.max(18, w * TW * 0.42);
    const wallH = Math.max(22, h * ZH * 0.95);
    ctx.drawImage(spr, snap(hang.sx - wallW / 2), snap(hang.sy - wallH), wallW, wallH);
    return;
  }
  const near = iso(x + w, y + d, z);
  const cx = snap(near.sx);
  const foot = snap(near.sy);
  if (h >= 0.2) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#1a1020";
    ctx.beginPath();
    ctx.ellipse(cx, foot - 3, destW * 0.26, TH * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const dx = snap(cx - destW / 2);
  const dy = snap(foot - destH);
  if (flip) {
    ctx.save();
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(spr, snap(-destW / 2), dy, destW, destH);
    ctx.restore();
  } else {
    ctx.drawImage(spr, dx, dy, destW, destH);
  }
}

function drawShillboard(ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement, def: FurnDef, p: Placed, z: number) {
  const { w } = footprint(def, p.rot);
  const hang = iso(p.x + w * 0.5, p.y + 0.08, z + 2.15);
  const wallW = Math.max(72, w * TW * 0.86);
  const wallH = Math.max(32, wallW * (spr.height / Math.max(1, spr.width)));
  const dx = snap(hang.sx - wallW / 2);
  const dy = snap(hang.sy - wallH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr, dx, dy, wallW, wallH);
  const screen = {
    x: dx + wallW * 0.16,
    y: dy + wallH * 0.22,
    w: wallW * 0.68,
    h: wallH * 0.52,
  };
  const label = "$" + (p.ticker || "");
  ctx.save();
  ctx.beginPath();
  ctx.rect(screen.x, screen.y, screen.w, screen.h);
  ctx.clip();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = Math.floor(screen.h * 0.62);
  ctx.font = `bold ${size}px Tahoma, "Courier New", monospace`;
  while (size > 7 && ctx.measureText(label).width > screen.w * 0.92) {
    size -= 1;
    ctx.font = `bold ${size}px Tahoma, "Courier New", monospace`;
  }
  const cx = screen.x + screen.w / 2;
  const cy = screen.y + screen.h / 2 + 0.5;
  ctx.lineWidth = Math.max(2, Math.round(size / 6));
  ctx.strokeStyle = "#04140c";
  ctx.fillStyle = "#14F195";
  ctx.strokeText(label, cx, cy);
  ctx.fillText(label, cx, cy);
  ctx.restore();
}

export function drawFurniture(
  ctx: CanvasRenderingContext2D,
  def: FurnDef,
  p: Placed,
  t: number,
  sprites?: Record<string, HTMLCanvasElement>,
  z = 0
) {
  const { w, d } = footprint(def, p.rot);
  const spr = sprites?.[def.id];
  if (spr && spr.width > 4) {
    const wall = def.slot === "wall";
    const flip = !wall && (p.rot === 1 || p.rot === 2);
    if (def.use === "ticker" && wall) {
      drawShillboard(ctx, spr, def, p, z);
      return;
    }
    drawSprite(ctx, spr, p.x, p.y, w, d, z, def.h, wall, flip);
    return;
  }
  const c = def.colors;
  const x = p.x;
  const y = p.y;
  const shape = def.shape;

  if (shape === "rug") {
    for (let dy = 0; dy < d; dy++) for (let dx = 0; dx < w; dx++) diamond(ctx, x + dx, y + dy, c.top, "rgba(0,0,0,0.08)");
    return;
  }
  if (shape === "pad") {
    diamond(ctx, x, y, c.top);
    const g = 0.4 + 0.2 * Math.sin(t * 4);
    cube(ctx, x + 0.2, y + 0.2, 0, 0.6, 0.6, g, c.accent || c.right, c.left, c.right);
    return;
  }
  if (shape === "bean") {
    cube(ctx, x + 0.1, y + 0.1, 0, 0.8, 0.8, 0.7, c.top, c.left, c.right);
    return;
  }
  if (shape === "sofa" || shape === "bench") {
    cube(ctx, x, y + 0.15, 0, w, d - 0.15, 0.7, c.top, c.left, c.right);
    cube(ctx, x, y, 0.7, w, 0.25, 0.7, shade(c.top, -10), c.left, c.right);
    return;
  }
  if (shape === "chair" || shape === "armchair") {
    cube(ctx, x + 0.15, y + 0.2, 0, 0.7, 0.6, 0.7, c.top, c.left, c.right);
    cube(ctx, x + 0.15, y, 0.7, 0.7, 0.2, 0.8, shade(c.top, -15), c.left, c.right);
    return;
  }
  if (shape === "stool") {
    cube(ctx, x + 0.25, y + 0.25, 0, 0.5, 0.5, 0.9, c.top, c.left, c.right);
    return;
  }
  if (shape === "bed" || shape === "canopy") {
    cube(ctx, x, y, 0, w, d, 0.5, c.top, c.left, c.right);
    cube(ctx, x, y, 0.5, w, 0.35, 0.25, c.accent || "#ff6b5a", c.left, c.right);
    if (shape === "canopy") {
      cube(ctx, x, y, 1.8, 0.12, 0.12, 0.2, c.right, c.left, c.right);
      cube(ctx, x + w - 0.12, y, 1.8, 0.12, 0.12, 0.2, c.right, c.left, c.right);
      cube(ctx, x, y, 2.0, w, 0.12, 0.12, c.top, c.left, c.right);
    }
    return;
  }
  if (shape === "lamp" || shape === "solamp") {
    cube(ctx, x + 0.4, y + 0.4, 0, 0.2, 0.2, 1.6, c.left, c.left, c.right);
    cube(ctx, x + 0.22, y + 0.22, 1.5, 0.56, 0.56, 0.5, c.top, shade(c.top, -20), c.right);
    return;
  }
  if (shape === "palm" || shape === "cactus" || shape === "hedge" || shape === "flower" || shape === "tree") {
    cube(ctx, x + 0.3, y + 0.3, 0, 0.4, 0.4, 0.4, c.left, shade(c.left, -20), c.left);
    cube(ctx, x + 0.35, y + 0.35, 0.4, 0.3, 0.3, shape === "tree" ? 1.6 : 1.1, c.top, shade(c.top, -25), c.right);
    if (shape === "palm" || shape === "tree") {
      cube(ctx, x + 0.05, y + 0.2, 1.4, 0.9, 0.4, 0.25, c.right, c.top, c.right);
    }
    return;
  }
  if (shape === "dice") {
    cube(ctx, x + 0.1, y + 0.1, 0, 0.8, 0.8, 1.1, c.top, c.left, c.right);
    ctx.fillStyle = "#111";
    const p0 = iso(x + 0.5, y + 0.5, 1.2);
    ctx.font = "12px sans-serif";
    ctx.fillText("?", p0.sx - 4, p0.sy);
    return;
  }
  if (shape === "frame" || shape === "board") {
    cube(ctx, x, y, 0.4, w, 0.2, 1.6, c.top, c.left, c.right);
    cube(ctx, x + 0.08, y + 0.02, 0.55, Math.max(0.3, w - 0.16), 0.12, 1.3, "#111", "#222", "#333");
    if (def.use === "ticker") {
      const pos = iso(x + w / 2, y + 0.1, 1.35);
      const label = "$" + (p.ticker || "");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 11px Tahoma, monospace";
      ctx.fillStyle = "#14F195";
      ctx.fillText(label, pos.sx, pos.sy);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
    return;
  }
  if (shape === "disco") {
    const pulse = 0.9 + Math.sin(t * 6) * 0.1;
    cube(ctx, x + 0.2, y + 0.2, 1.2, 0.6, 0.6, pulse, c.top, c.left, c.right);
    cube(ctx, x + 0.45, y + 0.45, 0, 0.1, 0.1, 1.2, "#333", "#222", "#444");
    return;
  }
  if (shape === "fountain") {
    cube(ctx, x, y, 0, w, d, 0.4, c.right, c.left, c.top);
    cube(ctx, x + 0.5, y + 0.5, 0.4, w - 1, d - 1, 0.8, c.top, c.left, c.right);
    return;
  }
  if (shape === "orb" || shape === "diamond" || shape === "prism") {
    cube(ctx, x + 0.2, y + 0.2, 0, 0.6, 0.6, 1.6, c.top, c.left, c.right);
    return;
  }
  if (shape === "tv" || shape === "pc" || shape === "arcade" || shape === "juke" || shape === "dj" || shape === "fridge") {
    cube(ctx, x, y, 0, w, d, def.h, c.top, c.left, c.right);
    cube(ctx, x + 0.1, y + 0.05, def.h * 0.35, Math.max(0.3, w - 0.2), 0.1, def.h * 0.5, "#111827", "#020617", c.accent || "#14F195");
    return;
  }
  cube(ctx, x, y, 0, w, d, Math.max(0.4, def.h), c.top, c.left, c.right);
}

type DrawOpts = {
  room: Room;
  occupants: Occupant[];
  ads: Ad[];
  cam: Cam;
  t: number;
  hover?: { x: number; y: number };
  ghost?: { def: FurnDef; x: number; y: number; rot: 0 | 1 | 2 | 3; ok: boolean };
  images?: Record<string, HTMLImageElement>;
  sprites?: Record<string, HTMLCanvasElement>;
};

export function drawRoom(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { room, occupants, cam, t } = opts;
  const layout = layoutById(room.layoutId);
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.imageSmoothingEnabled = false;

  const theme = wallTheme(layout);
  const floorA = layout.floorA || "#c9a36e";
  const floorB = layout.floorB || "#b8925c";

  const tiles: { x: number; y: number; fill: string; z: number }[] = [];
  for (let y = 0; y < layout.h; y++) {
    for (let x = 0; x < layout.w; x++) {
      const tile = walkable(layout, x, y) || isWater(layout, x, y);
      if (!tile) continue;
      let fill = (x + y) % 2 === 0 ? floorA : floorB;
      if (isDance(layout, x, y)) {
        const flash = Math.floor(t * 2 + x + y) % 3;
        fill = flash === 0 ? "#ff6bd6" : flash === 1 ? "#4fc3ff" : "#c084fc";
      } else if (isWater(layout, x, y)) fill = (x + y + Math.floor(t * 3)) % 2 === 0 ? "#5ee4f5" : "#2eb8d4";
      else if (isOutdoor(layout, x, y)) fill = (x + y) % 2 === 0 ? "#cfe88a" : "#b5d46a";
      tiles.push({ x, y, fill, z: tileH(layout, x, y) });
    }
  }
  for (const tile of tiles) {
    if (tile.z > 0.05 && !isStair(layout, tile.x, tile.y)) {
      cube(ctx, tile.x, tile.y, 0, 1, 1, tile.z, shade(tile.fill, -18), shade(tile.fill, -40), shade(tile.fill, -28));
    }
    if (isStair(layout, tile.x, tile.y)) {
      for (let i = 0; i < 4; i++) {
        cube(ctx, tile.x + 0.06, tile.y + 0.06, i * 0.15, 0.88, 0.88, 0.15, shade(tile.fill, 8 - i * 6), shade(tile.fill, -30), shade(tile.fill, -18));
      }
    }
    const ez = tileH(layout, tile.x + 1, tile.y);
    const sz = tileH(layout, tile.x, tile.y + 1);
    const eastOpen = (!walkable(layout, tile.x + 1, tile.y) && !isWater(layout, tile.x + 1, tile.y)) || ez + 0.15 < tile.z;
    const southOpen = (!walkable(layout, tile.x, tile.y + 1) && !isWater(layout, tile.x, tile.y + 1)) || sz + 0.15 < tile.z;
    if (eastOpen || southOpen) {
      floorDrop(ctx, tile.x, tile.y, eastOpen, southOpen, shade(tile.fill, -50), shade(tile.fill, -32), tile.z);
    }
  }
  for (const tile of tiles) {
    diamond(ctx, tile.x, tile.y, tile.fill, "#2a1c10", tile.z);
  }

  let backY = Infinity;
  let backX = Infinity;
  for (const tile of tiles) {
    if (tile.y < backY) backY = tile.y;
    if (tile.x < backX) backX = tile.x;
  }
  if (Number.isFinite(backY)) {
    let x = 0;
    while (x < layout.w) {
      const here = walkable(layout, x, backY) || isWater(layout, x, backY);
      if (!here) {
        x++;
        continue;
      }
      const z = tileH(layout, x, backY);
      let x1 = x;
      while (
        x1 + 1 < layout.w &&
        (walkable(layout, x1 + 1, backY) || isWater(layout, x1 + 1, backY)) &&
        Math.abs(tileH(layout, x1 + 1, backY) - z) < 0.05
      )
        x1++;
      wallRunN(ctx, x, x1, backY, z, theme);
      x = x1 + 1;
    }
  }
  if (Number.isFinite(backX)) {
    let y = 0;
    while (y < layout.h) {
      const here = walkable(layout, backX, y) || isWater(layout, backX, y);
      if (!here) {
        y++;
        continue;
      }
      const z = tileH(layout, backX, y);
      let y1 = y;
      while (
        y1 + 1 < layout.h &&
        (walkable(layout, backX, y1 + 1) || isWater(layout, backX, y1 + 1)) &&
        Math.abs(tileH(layout, backX, y1 + 1) - z) < 0.05
      )
        y1++;
      wallRunW(ctx, backX, y, y1, z, theme);
      y = y1 + 1;
    }
  }

  if (opts.ghost) {
    const { w, d } = footprint(opts.ghost.def, opts.ghost.rot);
    for (let dy = 0; dy < d; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const z = tileH(layout, opts.ghost.x + dx, opts.ghost.y + dy);
        diamond(
          ctx,
          opts.ghost.x + dx,
          opts.ghost.y + dy,
          opts.ghost.ok ? "rgba(20,241,149,0.4)" : "rgba(255,70,70,0.4)",
          opts.ghost.ok ? "#14F195" : "#ff5050",
          z
        );
      }
    }
  } else if (opts.hover && walkable(layout, opts.hover.x, opts.hover.y)) {
    diamond(ctx, opts.hover.x, opts.hover.y, "rgba(20,241,149,0.32)", "#14F195", tileH(layout, opts.hover.x, opts.hover.y));
  }

  type Spr = { depth: number; draw: () => void };
  const spr: Spr[] = [];

  for (const p of room.furniture) {
    const def = furn(p.catalogId);
    if (!def) continue;
    const { w, d } = footprint(def, p.rot);
    spr.push({
      depth: (p.x + w / 2 + p.y + d / 2) * 1000 + def.h,
      draw: () => {
        drawFurniture(ctx, def, p, t, opts.sprites, tileH(layout, p.x, p.y));
        if (def.use === "ad" || def.use === "frame") {
          const imgKey =
            def.use === "ad"
              ? opts.ads.find((a) => a.slotId === p.adSlot && a.status === "live" && new Date(a.end) > new Date())
                  ?.image
              : p.nftUrl;
          if (imgKey && opts.images?.[imgKey]) {
            const im = opts.images[imgKey];
            const pos = iso(p.x + 0.5, p.y, 1.4);
            ctx.save();
            ctx.drawImage(im, pos.sx - 18, pos.sy - 28, 36, 28);
            ctx.restore();
          } else if (imgKey === "builtin:sol" || imgKey === "builtin:btc") {
            const pos = iso(p.x + 0.5, p.y, 1.4);
            ctx.fillStyle = imgKey.endsWith("btc") ? "#f7931a" : "#9945FF";
            ctx.fillRect(pos.sx - 16, pos.sy - 24, 32, 22);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText(imgKey.endsWith("btc") ? "BTC" : "SOL", pos.sx - 12, pos.sy - 10);
          }
        }
      },
    });
  }

  for (const o of occupants) {
    spr.push({
      depth: (o.x + o.y) * 1000 + 8,
      draw: () => {
        const p = iso(o.x + 0.5, o.y + 0.5, tileH(layout, Math.round(o.x), Math.round(o.y)));
        drawAvatarIso(ctx, o.figure, p.sx, p.sy, o.dir, t + o.userId.length, {
          dance: o.dance,
          walking: o.moving,
          sit: !!o.sitUid && !o.moving,
          dist: o.dist,
        });
        ctx.font = "bold 11px Tahoma, sans-serif";
        const name = o.username;
        const nw = ctx.measureText(name).width;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 3;
        ctx.strokeText(name, p.sx - nw / 2, p.sy - AVATAR_NAME_LIFT);
        ctx.fillStyle = "#2a7dff";
        ctx.fillText(name, p.sx - nw / 2, p.sy - AVATAR_NAME_LIFT);
        if (o.chat && Date.now() - o.chat.at < 6000) {
          const msg = o.chat.text;
          ctx.font = "12px Tahoma, sans-serif";
          const mw = Math.min(200, ctx.measureText(msg).width + 16);
          const bx = snap(p.sx - mw / 2);
          const by = snap(p.sy - AVATAR_NAME_LIFT - 26);
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#222";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, mw, 22, 10);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p.sx - 6, by + 22);
          ctx.lineTo(p.sx, by + 30);
          ctx.lineTo(p.sx + 6, by + 22);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#111";
          ctx.fillText(msg.slice(0, 32), bx + 8, by + 15);
        }
      },
    });
  }

  spr.sort((a, b) => a.depth - b.depth);
  for (const s of spr) s.draw();

  if (opts.ghost) {
    ctx.globalAlpha = 0.55;
    drawFurniture(
      ctx,
      opts.ghost.def,
      { uid: "g", catalogId: opts.ghost.def.id, x: opts.ghost.x, y: opts.ghost.y, rot: opts.ghost.rot, ownerId: "" },
      t,
      opts.sprites,
      tileH(layout, opts.ghost.x, opts.ghost.y)
    );
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
