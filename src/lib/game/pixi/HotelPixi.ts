"use client";

import type { FurnDef } from "../../catalog";
import { furn, footprint } from "../../catalog";
import { isDance, isDoor, isOutdoor, isStair, isWater, layoutById, tileH, walkable, type Layout } from "../../layouts";
import type { Occupant, Room } from "../../types";
import { FOOT_Y, LOOK_W, paintLook } from "../lookDraw";
import { paintFurn, seatZ } from "../furnDraw";
import { iso, plantFurn } from "../iso";
import { keyAndTrim } from "../sprites";
import { CATALOG } from "../../catalog";
import { furnAt } from "../path";
import { shade } from "../avatar";
import { Application, Container, Graphics, Sprite, Text, Texture } from "pixi.js";

export type PixiFrame = {
  room: Room;
  occupants: Occupant[];
  cam: { x: number; y: number };
  t: number;
  hover?: { x: number; y: number };
  ghost?: { def: FurnDef; x: number; y: number; rot: 0 | 1 | 2 | 3; ok: boolean; wallLift?: 0 | 1 | 2 | 3 };
  view: { w: number; h: number };
  zoom: number;
};

function hexNum(s: string) {
  if (s.startsWith("#")) return parseInt(s.slice(1), 16) >>> 0;
  const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return ((Number(m[1]) << 16) | (Number(m[2]) << 8) | Number(m[3])) >>> 0;
  return 0x888888;
}

function wallPaper(layout: Layout, paper?: string) {
  if (layout.id === "shill_club") return paper || "#3b1860";
  if (layout.id === "pixel_arcade") return paper || "#3b1d6e";
  return paper || layout.paper || "#e6d7bc";
}

const furnTex = new Map<string, Texture>();
const lookTex = new Map<string, Texture>();
const pngFurn = new Map<string, Texture>();

function loadFurnPng(id: string) {
  if (pngFurn.has(id)) return;
  const img = new Image();
  img.onload = () => {
    const keyed = keyAndTrim(img);
    pngFurn.set(id, Texture.from(keyed));
  };
  img.onerror = () => pngFurn.set(id, Texture.EMPTY);
  img.src = `/art/furn/${id}.png?v=30`;
}

function furnTexture(def: FurnDef, rot: 0 | 1 | 2 | 3) {
  const png = pngFurn.get(def.id);
  if (png && png !== Texture.EMPTY) return png;
  const key = `${def.id}:${rot}`;
  const hit = furnTex.get(key);
  if (hit) return hit;
  const c = paintFurn(def, rot);
  const t = Texture.from(c);
  furnTex.set(key, t);
  return t;
}

function lookTexture(fig: Occupant["figure"], dir: 0 | 1 | 2 | 3, sit: boolean, lay: boolean, walk: 0 | 1) {
  const key = `${JSON.stringify(fig)}:${dir}:${sit ? 1 : 0}:${lay ? 1 : 0}:${walk}`;
  const hit = lookTex.get(key);
  if (hit) return hit;
  const c = paintLook(fig, { view: dir, sit, lay, walk }).canvas();
  const t = Texture.from(c);
  lookTex.set(key, t);
  if (lookTex.size > 240) {
    const first = lookTex.keys().next().value;
    if (first) {
      lookTex.get(first)?.destroy(true);
      lookTex.delete(first);
    }
  }
  return t;
}

export class HotelPixi {
  app: Application | null = null;
  host: HTMLElement | null = null;
  world = new Container({ sortableChildren: true });
  floor = new Graphics();
  objects = new Container({ sortableChildren: true });
  ghost = new Graphics();
  private furnSpr = new Map<string, Sprite>();
  private avSpr = new Map<string, Sprite>();
  private names = new Map<string, Text>();
  private floorKey = "";
  ready = false;

  async mount(host: HTMLElement) {
    this.host = host;
    const app = new Application();
    await app.init({
      background: 0x050508,
      resizeTo: host,
      antialias: false,
      autoDensity: true,
      resolution: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    });
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.imageRendering = "pixelated";
    canvas.className = "absolute inset-0 h-full w-full cursor-pointer touch-none select-none";
    host.appendChild(canvas);
    this.world.addChild(this.floor);
    this.world.addChild(this.objects);
    this.world.addChild(this.ghost);
    app.stage.addChild(this.world);
    this.app = app;
    this.ready = true;
    for (const item of CATALOG) loadFurnPng(item.id);
  }

  get canvas() {
    return this.app?.canvas as HTMLCanvasElement | undefined;
  }

  draw(frame: PixiFrame) {
    if (!this.app || !this.ready) return;
    const { room, occupants, cam, view, zoom } = frame;
    const layout = layoutById(room.layoutId);
    this.world.scale.set(zoom);
    this.world.position.set(cam.x * zoom + (view.w / 2) * (1 - zoom), cam.y * zoom + (view.h / 2) * (1 - zoom));

    this.paintFloor(layout, room, frame.t);
    this.paintFurniture(room, layout);
    this.paintAvatars(room, occupants, layout);
    this.paintGhost(frame, layout);
    this.objects.sortChildren();
  }

  private paintFloor(layout: Layout, room: Room, t: number) {
    const paper = wallPaper(layout, room.paper);
    const floorA = room.floorA || layout.floorA || "#c9a36e";
    const floorB = room.floorB || layout.floorB || "#b8925c";
    const key = `${layout.id}:${paper}:${floorA}:${floorB}:${Math.floor(t * 2)}`;
    if (key === this.floorKey) return;
    this.floorKey = key;
    const g = this.floor;
    g.clear();
    const tiles: { x: number; y: number; z: number; fill: string }[] = [];
    for (let y = 0; y < layout.h; y++) {
      for (let x = 0; x < layout.w; x++) {
        if (!walkable(layout, x, y) && !isWater(layout, x, y)) continue;
        let fill = (x + y) % 2 === 0 ? floorA : floorB;
        if (isDance(layout, x, y)) {
          const flash = Math.floor(t * 2 + x + y) % 3;
          fill = flash === 0 ? "#ff6bd6" : flash === 1 ? "#4fc3ff" : "#c084fc";
        } else if (isWater(layout, x, y)) fill = (x + y + Math.floor(t * 3)) % 2 === 0 ? "#5ee4f5" : "#2eb8d4";
        else if (isOutdoor(layout, x, y)) fill = (x + y) % 2 === 0 ? "#cfe88a" : "#b5d46a";
        tiles.push({ x, y, z: tileH(layout, x, y), fill });
      }
    }
    for (const tile of tiles) {
      if (tile.z > 0.05 && !isStair(layout, tile.x, tile.y)) {
        this.cube(g, tile.x, tile.y, 0, 1, 1, tile.z, shade(tile.fill, -18), shade(tile.fill, -40), shade(tile.fill, -28));
      }
      this.diamond(g, tile.x, tile.y, tile.z, tile.fill, 0x2a1810, 0.14);
    }
    let backY = Infinity;
    let backX = Infinity;
    for (const tile of tiles) {
      if (tile.y < backY) backY = tile.y;
      if (tile.x < backX) backX = tile.x;
    }
    const cap = layout.id === "shill_club" ? 7.9 : 7.4;
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
        while (x1 + 1 < layout.w && (walkable(layout, x1 + 1, backY) || isWater(layout, x1 + 1, backY))) x1++;
        this.wallN(g, x, x1, backY, z, cap, paper);
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
        while (y1 + 1 < layout.h && (walkable(layout, backX, y1 + 1) || isWater(layout, backX, y1 + 1))) y1++;
        this.wallW(g, backX, y, y1, z, cap, paper);
        y = y1 + 1;
      }
    }
    for (let y = 0; y < layout.h; y++) {
      for (let x = 0; x < layout.w; x++) {
        if (!isDoor(layout, x, y)) continue;
        const z = tileH(layout, x, y);
        this.cube(g, x + 0.12, y + 0.55, z, 0.18, 0.18, 2.2, "#c9a227", "#8a6a00", "#e0c068");
        this.cube(g, x + 0.7, y + 0.55, z, 0.18, 0.18, 2.2, "#c9a227", "#8a6a00", "#e0c068");
      }
    }
  }

  private diamond(g: Graphics, x: number, y: number, z: number, fill: string, stroke = 0x2a1810, sa = 0.14) {
    const t = iso(x, y, z);
    const r = iso(x + 1, y, z);
    const b = iso(x + 1, y + 1, z);
    const l = iso(x, y + 1, z);
    g.poly([t.sx, t.sy, r.sx, r.sy, b.sx, b.sy, l.sx, l.sy]);
    g.fill({ color: hexNum(fill) });
    g.stroke({ width: 1, color: stroke, alpha: sa });
  }

  private cube(g: Graphics, x: number, y: number, z: number, w: number, d: number, h: number, top: string, left: string, right: string) {
    const A = iso(x, y + d, z + h);
    const B = iso(x + w, y + d, z + h);
    const C = iso(x + w, y, z + h);
    const E = iso(x, y, z + h);
    const A2 = iso(x, y + d, z);
    const B2 = iso(x + w, y + d, z);
    const C2 = iso(x + w, y, z);
    g.poly([A.sx, A.sy, B.sx, B.sy, B2.sx, B2.sy, A2.sx, A2.sy]);
    g.fill({ color: hexNum(left) });
    g.poly([C.sx, C.sy, B.sx, B.sy, B2.sx, B2.sy, C2.sx, C2.sy]);
    g.fill({ color: hexNum(right) });
    g.poly([E.sx, E.sy, C.sx, C.sy, B.sx, B.sy, A.sx, A.sy]);
    g.fill({ color: hexNum(top) });
  }

  private wallN(g: Graphics, x0: number, x1: number, y: number, z: number, top: number, paper: string) {
    const a = iso(x0, y, top);
    const b = iso(x1 + 1, y, top);
    const c = iso(x1 + 1, y, z);
    const d = iso(x0, y, z);
    g.poly([a.sx, a.sy, b.sx, b.sy, c.sx, c.sy, d.sx, d.sy]);
    g.fill({ color: hexNum(paper) });
  }

  private wallW(g: Graphics, x: number, y0: number, y1: number, z: number, top: number, paper: string) {
    const a = iso(x, y0, top);
    const b = iso(x, y1 + 1, top);
    const c = iso(x, y1 + 1, z);
    const d = iso(x, y0, z);
    g.poly([a.sx, a.sy, b.sx, b.sy, c.sx, c.sy, d.sx, d.sy]);
    g.fill({ color: hexNum(shade(paper, -22)) });
  }

  private paintFurniture(room: Room, layout: Layout) {
    const seen = new Set<string>();
    for (const p of room.furniture) {
      const def = furn(p.catalogId);
      if (!def) continue;
      const { w, d } = footprint(def, p.rot);
      const tex = furnTexture(def, p.rot);
      let spr = this.furnSpr.get(p.uid);
      if (!spr) {
        spr = new Sprite(tex);
        this.objects.addChild(spr);
        this.furnSpr.set(p.uid, spr);
      } else if (spr.texture !== tex) spr.texture = tex;
      spr.roundPixels = true;
      const z = tileH(layout, p.x, p.y);
      const planted = plantFurn(p.x, p.y, z, w, d, def.h, tex.width, tex.height);
      spr.x = planted.x;
      spr.y = planted.y;
      spr.width = planted.destW;
      spr.height = planted.destH;
      spr.zIndex = (p.x + w / 2 + p.y + d / 2) * 1000 + def.h;
      seen.add(p.uid);
    }
    for (const [uid, spr] of this.furnSpr) {
      if (seen.has(uid)) continue;
      spr.destroy();
      this.furnSpr.delete(uid);
    }
  }

  private paintAvatars(room: Room, occupants: Occupant[], layout: Layout) {
    const seen = new Set<string>();
    for (const o of occupants) {
      const sitting = !!o.sitUid && !o.moving && !o.lay;
      const laying = !!o.sitUid && !o.moving && !!o.lay;
      const seat = (sitting || laying) ? furnAt(room.furniture, Math.round(o.x), Math.round(o.y)) : undefined;
      const seatDef = seat ? furn(seat.catalogId) : undefined;
      const walk: 0 | 1 = o.moving ? 1 : 0;
      const tex = lookTexture(o.figure, o.dir, sitting, laying, walk);
      let spr = this.avSpr.get(o.userId);
      if (!spr) {
        spr = new Sprite(tex);
        this.objects.addChild(spr);
        this.avSpr.set(o.userId, spr);
      } else if (spr.texture !== tex) spr.texture = tex;
      spr.roundPixels = true;
      const restH = (sitting || laying) && seatDef ? seatZ(seatDef) : 0;
      const p = iso(o.x + 0.5, o.y + 0.5, tileH(layout, Math.round(o.x), Math.round(o.y)) + restH);
      if (laying) {
        spr.anchor.set(0.5, 0.7);
        spr.x = Math.round(p.sx);
        spr.y = Math.round(p.sy);
      } else {
        spr.anchor.set(0, 0);
        spr.x = Math.round(p.sx - LOOK_W / 2);
        spr.y = Math.round(p.sy - FOOT_Y);
      }
      const fp = seatDef && seat ? footprint(seatDef, seat.rot) : { w: 1, d: 1 };
      spr.zIndex =
        (sitting || laying) && seatDef && seat
          ? (seat.x + fp.w / 2 + seat.y + fp.d / 2) * 1000 + seatDef.h + 80
          : (o.x + o.y) * 1000 + 8;
      seen.add(o.userId);

      let label = this.names.get(o.userId);
      if (!label) {
        label = new Text({
          text: o.username,
          style: { fontFamily: "Tahoma, sans-serif", fontSize: 11, fontWeight: "bold", fill: 0x2a7dff, stroke: { color: 0x111111, width: 3 } },
        });
        this.objects.addChild(label);
        this.names.set(o.userId, label);
      } else if (label.text !== o.username) label.text = o.username;
      label.x = Math.round(p.sx - label.width / 2);
      label.y = Math.round(p.sy - 56);
      label.zIndex = spr.zIndex + 1;
    }
    for (const [id, spr] of this.avSpr) {
      if (seen.has(id)) continue;
      spr.destroy();
      this.avSpr.delete(id);
      this.names.get(id)?.destroy();
      this.names.delete(id);
    }
  }

  private paintGhost(frame: PixiFrame, layout: Layout) {
    const g = this.ghost;
    g.clear();
    if (frame.ghost) {
      const { w, d } = footprint(frame.ghost.def, frame.ghost.rot);
      for (let dy = 0; dy < d; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const z = tileH(layout, frame.ghost.x + dx, frame.ghost.y + dy);
          this.diamond(g, frame.ghost.x + dx, frame.ghost.y + dy, z, frame.ghost.ok ? "#14F195" : "#ff5050", frame.ghost.ok ? 0x14f195 : 0xff5050, 0.85);
        }
      }
      g.alpha = 0.45;
    } else if (frame.hover && walkable(layout, frame.hover.x, frame.hover.y)) {
      this.diamond(g, frame.hover.x, frame.hover.y, tileH(layout, frame.hover.x, frame.hover.y), "#14F195", 0x14f195, 0.9);
      g.alpha = 0.35;
    }
  }

  destroy() {
    this.ready = false;
    this.app?.destroy({ removeView: true });
    this.app = null;
    this.furnSpr.clear();
    this.avSpr.clear();
    this.names.clear();
  }
}
