import type { FurnDef } from "../catalog";
import { furn, footprint } from "../catalog";
import type { Ad, Occupant, Placed, Room } from "../types";
import { layoutById, isDance, isOutdoor, isWater, walkable } from "../layouts";
import { iso, TW, TH } from "./iso";
import { drawAvatarIso, shade } from "./avatar";

function snap(n: number) {
  return Math.round(n);
}

export type Cam = { x: number; y: number };

export function tileAt(cam: Cam, mx: number, my: number) {
  const sx = mx - cam.x;
  const sy = my - cam.y;
  const x = (sx / (TW / 2) + sy / (TH / 2)) / 2;
  const y = (sy / (TH / 2) - sx / (TW / 2)) / 2;
  return { x: Math.floor(x), y: Math.floor(y) };
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string, stroke = "#2a1810") {
  const p = iso(x, y);
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

function floorDrop(ctx: CanvasRenderingContext2D, x: number, y: number, east: boolean, south: boolean, dark: string, mid: string) {
  const p = iso(x, y);
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

function poly(ctx: CanvasRenderingContext2D, pts: { sx: number; sy: number }[], fill: string) {
  ctx.beginPath();
  ctx.moveTo(snap(pts[0].sx), snap(pts[0].sy));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(snap(pts[i].sx), snap(pts[i].sy));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(20,10,30,0.55)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function pane(
  ctx: CanvasRenderingContext2D,
  pts: { sx: number; sy: number }[],
  glass: string
) {
  poly(ctx, pts, glass);
}

function wallN(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, paper: string) {
  const h = 4.2;
  poly(ctx, [iso(x, y, h), iso(x + 1, y, h), iso(x + 1, y, 0), iso(x, y, 0)], paper);
  poly(ctx, [iso(x, y, 0.38), iso(x + 1, y, 0.38), iso(x + 1, y, 0), iso(x, y, 0)], "#b07a38");
  poly(ctx, [iso(x, y, h), iso(x + 1, y, h), iso(x + 1, y, h - 0.32), iso(x, y, h - 0.32)], "#e8c04a");
  pane(ctx, [iso(x + 0.16, y, 2.7), iso(x + 0.48, y, 2.7), iso(x + 0.48, y, 1.85), iso(x + 0.16, y, 1.85)], "#8fe4ff");
  pane(ctx, [iso(x + 0.52, y, 2.7), iso(x + 0.84, y, 2.7), iso(x + 0.84, y, 1.85), iso(x + 0.52, y, 1.85)], "#7ed7f8");
  pane(ctx, [iso(x + 0.16, y, 1.78), iso(x + 0.48, y, 1.78), iso(x + 0.48, y, 1.05), iso(x + 0.16, y, 1.05)], "#7ed7f8");
  pane(ctx, [iso(x + 0.52, y, 1.78), iso(x + 0.84, y, 1.78), iso(x + 0.84, y, 1.05), iso(x + 0.52, y, 1.05)], "#6ec8ea");
  void color;
}

function wallW(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, paper: string) {
  const h = 4.2;
  const left = shade(paper, -26);
  poly(ctx, [iso(x, y, h), iso(x, y + 1, h), iso(x, y + 1, 0), iso(x, y, 0)], left);
  poly(ctx, [iso(x, y, 0.38), iso(x, y + 1, 0.38), iso(x, y + 1, 0), iso(x, y, 0)], "#8a5a28");
  poly(ctx, [iso(x, y, h), iso(x, y + 1, h), iso(x, y + 1, h - 0.32), iso(x, y, h - 0.32)], "#c9a227");
  pane(ctx, [iso(x, y + 0.16, 2.7), iso(x, y + 0.48, 2.7), iso(x, y + 0.48, 1.85), iso(x, y + 0.16, 1.85)], "#6ec8ea");
  pane(ctx, [iso(x, y + 0.52, 2.7), iso(x, y + 0.84, 2.7), iso(x, y + 0.84, 1.85), iso(x, y + 0.52, 1.85)], "#5eb8dc");
  pane(ctx, [iso(x, y + 0.16, 1.78), iso(x, y + 0.48, 1.78), iso(x, y + 0.48, 1.05), iso(x, y + 0.16, 1.05)], "#5eb8dc");
  pane(ctx, [iso(x, y + 0.52, 1.78), iso(x, y + 0.84, 1.78), iso(x, y + 0.84, 1.05), iso(x, y + 0.52, 1.05)], "#4ea8cc");
  void color;
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  spr: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  d: number
) {
  const near = iso(x + w, y + d);
  const destW = Math.max(8, (w + d) * (TW / 2));
  const destH = destW * (spr.height / Math.max(1, spr.width));
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#1a1020";
  ctx.beginPath();
  ctx.ellipse(snap(near.sx), snap(near.sy - 4), destW * 0.28, TH * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.drawImage(spr, snap(near.sx - destW / 2), snap(near.sy - destH), destW, destH);
}

export function drawFurniture(
  ctx: CanvasRenderingContext2D,
  def: FurnDef,
  p: Placed,
  t: number,
  sprites?: Record<string, HTMLCanvasElement>
) {
  const { w, d } = footprint(def, p.rot);
  const spr = sprites?.[def.id];
  if (spr && spr.width > 4) {
    drawSprite(ctx, spr, p.x, p.y, w, d);
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

  const paper = layout.paper || "#8ee0c4";
  const wall = paper;
  const floorA = layout.floorA || "#4db7ea";
  const floorB = layout.floorB || "#3aa6dc";

  const tiles: { x: number; y: number; fill: string }[] = [];
  for (let y = 0; y < layout.h; y++) {
    for (let x = 0; x < layout.w; x++) {
      const tile = walkable(layout, x, y) || isWater(layout, x, y);
      if (!tile) continue;
      let fill = (x + y) % 2 === 0 ? floorA : floorB;
      if (isDance(layout, x, y)) {
        const flash = Math.floor(t * 2 + x + y) % 3;
        fill = flash === 0 ? "#ff4fd8" : flash === 1 ? "#45f0ff" : "#9945FF";
      } else if (isWater(layout, x, y)) fill = (x + y) % 2 === 0 ? "#3ec6e0" : "#2aa8c8";
      else if (isOutdoor(layout, x, y)) fill = (x + y) % 2 === 0 ? "#cfe88a" : "#b5d46a";
      tiles.push({ x, y, fill });
    }
  }
  for (const tile of tiles) {
    const eastOpen = !walkable(layout, tile.x + 1, tile.y) && !isWater(layout, tile.x + 1, tile.y);
    const southOpen = !walkable(layout, tile.x, tile.y + 1) && !isWater(layout, tile.x, tile.y + 1);
    if (eastOpen || southOpen) {
      floorDrop(ctx, tile.x, tile.y, eastOpen, southOpen, shade(tile.fill, -50), shade(tile.fill, -32));
    }
  }
  for (const tile of tiles) {
    diamond(ctx, tile.x, tile.y, tile.fill, "#1a140c");
  }
  for (const tile of tiles) {
    if (!walkable(layout, tile.x, tile.y - 1) && !isWater(layout, tile.x, tile.y - 1)) wallN(ctx, tile.x, tile.y, wall, paper);
    if (!walkable(layout, tile.x - 1, tile.y) && !isWater(layout, tile.x - 1, tile.y)) wallW(ctx, tile.x, tile.y, wall, paper);
  }

  if (opts.ghost) {
    const { w, d } = footprint(opts.ghost.def, opts.ghost.rot);
    for (let dy = 0; dy < d; dy++) {
      for (let dx = 0; dx < w; dx++) {
        diamond(
          ctx,
          opts.ghost.x + dx,
          opts.ghost.y + dy,
          opts.ghost.ok ? "rgba(20,241,149,0.4)" : "rgba(255,70,70,0.4)",
          opts.ghost.ok ? "#14F195" : "#ff5050"
        );
      }
    }
  } else if (opts.hover && walkable(layout, opts.hover.x, opts.hover.y)) {
    diamond(ctx, opts.hover.x, opts.hover.y, "rgba(20,241,149,0.32)", "#14F195");
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
        drawFurniture(ctx, def, p, t, opts.sprites);
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
        const p = iso(o.x + 0.5, o.y + 0.5, 0);
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
        ctx.strokeText(name, p.sx - nw / 2, p.sy - 64);
        ctx.fillStyle = "#2a7dff";
        ctx.fillText(name, p.sx - nw / 2, p.sy - 64);
        if (o.chat && Date.now() - o.chat.at < 6000) {
          const msg = o.chat.text;
          ctx.font = "12px Tahoma, sans-serif";
          const mw = Math.min(200, ctx.measureText(msg).width + 16);
          const bx = snap(p.sx - mw / 2);
          const by = snap(p.sy - 98);
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
      opts.sprites
    );
    ctx.globalAlpha = 1;
    diamond(ctx, opts.ghost.x, opts.ghost.y, opts.ghost.ok ? "rgba(20,241,149,0.25)" : "rgba(255,80,80,0.3)");
  }

  ctx.restore();
}
