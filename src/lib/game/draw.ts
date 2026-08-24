import type { FurnDef } from "../catalog";
import { furn, footprint } from "../catalog";
import type { Ad, Occupant, Placed, Room } from "../types";
import { layoutById, isDance, isOutdoor, isWater, walkable } from "../layouts";
import { iso, TW, TH } from "./iso";
import { drawAvatarIso, shade } from "./avatar";

export type Cam = { x: number; y: number };

export function tileAt(cam: Cam, mx: number, my: number) {
  const sx = mx - cam.x;
  const sy = my - cam.y;
  const x = (sx / (TW / 2) + sy / (TH / 2)) / 2;
  const y = (sy / (TH / 2) - sx / (TW / 2)) / 2;
  return { x: Math.floor(x), y: Math.floor(y) };
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string, stroke = "rgba(0,0,0,0.18)") {
  const p = iso(x, y);
  ctx.beginPath();
  ctx.moveTo(p.sx, p.sy);
  ctx.lineTo(p.sx + TW / 2, p.sy + TH / 2);
  ctx.lineTo(p.sx, p.sy + TH);
  ctx.lineTo(p.sx - TW / 2, p.sy + TH / 2);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();
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
  ctx.moveTo(pts[0].sx, pts[0].sy);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(20,10,30,0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function wallN(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const h = 3.4;
  const a = iso(x, y, h);
  const b = iso(x + 1, y, h);
  const c = iso(x + 1, y, 0);
  const d = iso(x, y, 0);
  poly(ctx, [a, b, c, d], color);
}

function wallW(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const h = 3.4;
  const a = iso(x, y, h);
  const b = iso(x, y + 1, h);
  const c = iso(x, y + 1, 0);
  const d = iso(x, y, 0);
  poly(ctx, [a, b, c, d], shade(color, -18));
}

export function drawFurniture(ctx: CanvasRenderingContext2D, def: FurnDef, p: Placed, t: number) {
  const { w, d } = footprint(def, p.rot);
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
};

export function drawRoom(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { room, occupants, cam, t } = opts;
  const layout = layoutById(room.layoutId);
  ctx.save();
  ctx.translate(cam.x, cam.y);

  const wall = layout.indoor ? "#e8b8a4" : "#f3d2c2";
  const floorA = layout.id === "shill_club" ? "#2a1848" : layout.id.includes("pool") ? "#f4a98a" : "#f3d7c2";
  const floorB = layout.id === "shill_club" ? "#1b0f33" : "#ecd0b8";

  for (let y = 0; y < layout.h; y++) {
    for (let x = 0; x < layout.w; x++) {
      if (!walkable(layout, x, y) && !isWater(layout, x, y)) continue;
      let fill = (x + y) % 2 === 0 ? floorA : floorB;
      if (isDance(layout, x, y)) {
        const flash = Math.floor(t * 2 + x + y) % 3;
        fill = flash === 0 ? "#ff4fd8" : flash === 1 ? "#45f0ff" : "#9945FF";
      } else if (isWater(layout, x, y)) fill = (x + y) % 2 === 0 ? "#3ec6e0" : "#2aa8c8";
      else if (isOutdoor(layout, x, y)) fill = (x + y) % 2 === 0 ? "#e8c9a0" : "#d9b48a";
      diamond(ctx, x, y, fill);
      if (!walkable(layout, x, y - 1) && !isWater(layout, x, y - 1)) wallN(ctx, x, y, wall);
      if (!walkable(layout, x - 1, y) && !isWater(layout, x - 1, y)) wallW(ctx, x, y, wall);
    }
  }

  if (opts.hover && walkable(layout, opts.hover.x, opts.hover.y)) {
    diamond(ctx, opts.hover.x, opts.hover.y, "rgba(20,241,149,0.35)", "#14F195");
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
        drawFurniture(ctx, def, p, t);
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
        drawAvatarIso(ctx, o.figure, p.sx, p.sy, o.dir, t + o.userId.length, o.dance);
        ctx.fillStyle = "rgba(10,8,20,0.7)";
        ctx.font = "600 11px Nunito, sans-serif";
        const tw = ctx.measureText(o.username).width;
        ctx.fillRect(p.sx - tw / 2 - 4, p.sy - 58, tw + 8, 14);
        ctx.fillStyle = "#fff";
        ctx.fillText(o.username, p.sx - tw / 2, p.sy - 47);
        if (o.chat && Date.now() - o.chat.at < 5000) {
          const msg = o.chat.text;
          const mw = Math.min(180, ctx.measureText(msg).width + 12);
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#24143d";
          ctx.beginPath();
          ctx.roundRect(p.sx - mw / 2, p.sy - 84, mw, 22, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#24143d";
          ctx.fillText(msg.slice(0, 28), p.sx - mw / 2 + 6, p.sy - 69);
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
      t
    );
    ctx.globalAlpha = 1;
    diamond(ctx, opts.ghost.x, opts.ghost.y, opts.ghost.ok ? "rgba(20,241,149,0.25)" : "rgba(255,80,80,0.3)");
  }

  ctx.restore();
}
