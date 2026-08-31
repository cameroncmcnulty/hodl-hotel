"use client";

import type { FurnDef } from "../../catalog";
import { furn, footprint, visualFill } from "../../catalog";
import { isDance, isDoor, isOutdoor, isStair, isWater, layoutById, tileH, walkable, type Layout } from "../../layouts";
import type { Occupant, Room } from "../../types";
import { seatZ } from "../furnDraw";
import { shade } from "../avatar";
import { getOgCanvas, ogScale } from "../ogLook";
import { camToFit, iso, plantFurn, TW } from "../iso";
import { furnAt } from "../path";
import { Application, Container, Graphics, Sprite, Text, Texture, TextureStyle } from "pixi.js";
import { isoBox, isoDiamond } from "./pixiArt";

export type PixiFrame = {
  room: Room;
  occupants: Occupant[];
  cam: { x: number; y: number };
  t: number;
  hover?: { x: number; y: number };
  ghost?: { def: FurnDef; x: number; y: number; rot: 0 | 1 | 2 | 3; ok: boolean; wallLift?: 0 | 1 | 2 | 3 };
  view: { w: number; h: number };
  zoom: number;
  sprites?: Record<string, HTMLCanvasElement>;
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



export class HotelPixi {
  app: Application | null = null;
  host: HTMLElement | null = null;
  world = new Container({ sortableChildren: true });
  floor = new Graphics();
  objects = new Container({ sortableChildren: true });
  ghost = new Graphics();
  private ghostSpr = new Sprite();
  private furnN = new Map<string, Container>();
  private furnKind = new Map<string, string>();
  private tex = new Map<string, { tex: Texture; w: number; h: number }>();
  private avG = new Map<string, Container>();
  private avKey = new Map<string, string>();
  private names = new Map<string, Text>();
  private floorKey = "";
  ready = false;

  async mount(host: HTMLElement) {
    this.host = host;
    TextureStyle.defaultOptions.scaleMode = "nearest";
    const app = new Application();
    await app.init({
      background: 0x050508,
      resizeTo: host,
      antialias: false,
      roundPixels: true,
      autoDensity: false,
      resolution: 1,
    });
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.imageRendering = "pixelated";
    canvas.className = "absolute inset-0 h-full w-full cursor-pointer touch-none select-none";
    host.appendChild(canvas);
    this.ghostSpr.anchor.set(0.5, 1);
    this.ghostSpr.roundPixels = true;
    this.ghostSpr.visible = false;
    this.world.addChild(this.floor);
    this.world.addChild(this.objects);
    this.world.addChild(this.ghost);
    this.world.addChild(this.ghostSpr);
    app.stage.addChild(this.world);
    this.app = app;
    this.ready = true;
  }

  get canvas() {
    return this.app?.canvas as HTMLCanvasElement | undefined;
  }

  draw(frame: PixiFrame) {
    if (!this.app || !this.ready) return;
    const { room, view } = frame;
    const layout = layoutById(room.layoutId);
    const fit = camToFit(layout, view.w, view.h);
    this.world.scale.set(fit.scale);
    this.world.position.set(fit.ox, fit.oy);

    this.paintFloor(layout, room, frame.t);
    this.clearFurniture();
    this.clearAvatars();
    this.paintGhost(frame, layout);
    this.objects.sortChildren();
  }

  private paintFloor(layout: Layout, room: Room, t: number) {
    const paper = wallPaper(layout, room.paper);
    const floorA = room.floorA || layout.floorA || "#d4b48a";
    const floorB = room.floorB || layout.floorB || "#c19a6e";
    const key = `${layout.id}:${paper}:${floorA}:${floorB}:${Math.floor(t * 2)}`;
    if (key === this.floorKey) return;
    this.floorKey = key;
    const g = this.floor;
    g.clear();
    const ink = 0x1a120c;
    const doorInk = 0x07060a;
    const capZ = layout.indoor === false ? 4.2 : layout.id === "shill_club" ? 7.9 : 7.4;
    const doorH = 3.55;
    const EDGE = 10;
    const isFloor = (x: number, y: number) => walkable(layout, x, y) || isWater(layout, x, y);

    const tiles: { x: number; y: number; z: number; fill: string }[] = [];
    for (let y = 0; y < layout.h; y++) {
      for (let x = 0; x < layout.w; x++) {
        if (!isFloor(x, y)) continue;
        let fill = (x + y) % 2 === 0 ? floorA : floorB;
        if (isDance(layout, x, y)) {
          const flash = Math.floor(t * 2 + x + y) % 3;
          fill = flash === 0 ? "#ff6bd6" : flash === 1 ? "#4fc3ff" : "#c084fc";
        } else if (isWater(layout, x, y)) fill = (x + y + Math.floor(t * 3)) % 2 === 0 ? "#5ee4f5" : "#2eb8d4";
        else if (isOutdoor(layout, x, y)) fill = (x + y) % 2 === 0 ? "#cfe88a" : "#b5d46a";
        tiles.push({ x, y, z: tileH(layout, x, y), fill });
      }
    }

    const fillQuad = (pts: { sx: number; sy: number }[], color: number) => {
      const flat: number[] = [];
      for (const p of pts) flat.push(Math.round(p.sx), Math.round(p.sy));
      g.poly(flat);
      g.fill({ color });
    };
    const strokeQuad = (pts: { sx: number; sy: number }[], color: number, width = 1) => {
      const flat: number[] = [];
      for (const p of pts) flat.push(Math.round(p.sx), Math.round(p.sy));
      g.poly(flat);
      g.stroke({ width, color, join: "round" });
    };
    const line = (a: { sx: number; sy: number }, b: { sx: number; sy: number }, color: number) => {
      g.moveTo(Math.round(a.sx), Math.round(a.sy));
      g.lineTo(Math.round(b.sx), Math.round(b.sy));
      g.stroke({ width: 1, color });
    };

    const northWall = (x: number, y: number) => isFloor(x, y) && !isFloor(x, y - 1);
    const westWall = (x: number, y: number) => isFloor(x, y) && !isFloor(x - 1, y);

    const punchDoorW = (x: number, y: number, z: number) => {
      const ht = z + doorH;
      const i0 = iso(x, y + 0.08, z);
      const i1 = iso(x, y + 0.92, z);
      const i2 = iso(x, y + 0.92, ht);
      const i3 = iso(x, y + 0.08, ht);
      fillQuad([i0, i1, i2, i3], doorInk);
      strokeQuad([i0, i1, i2, i3], 0x000000, 2);
      fillQuad(
        [iso(x, y + 0.18, z + 0.04), iso(x, y + 0.82, z + 0.04), iso(x, y + 0.82, ht - 0.1), iso(x, y + 0.18, ht - 0.1)],
        0x000000
      );
    };
    const punchDoorN = (x: number, y: number, z: number) => {
      const ht = z + doorH;
      const i0 = iso(x + 0.08, y, z);
      const i1 = iso(x + 0.92, y, z);
      const i2 = iso(x + 0.92, y, ht);
      const i3 = iso(x + 0.08, y, ht);
      fillQuad([i0, i1, i2, i3], doorInk);
      strokeQuad([i0, i1, i2, i3], 0x000000, 2);
      fillQuad(
        [iso(x + 0.18, y, z + 0.04), iso(x + 0.82, y, z + 0.04), iso(x + 0.82, y, ht - 0.1), iso(x + 0.18, y, ht - 0.1)],
        0x000000
      );
    };

    for (let x = 0; x < layout.w; x++) {
      let y = 0;
      while (y < layout.h) {
        if (!westWall(x, y)) {
          y++;
          continue;
        }
        const z = tileH(layout, x, y);
        let y1 = y;
        while (y1 + 1 < layout.h && westWall(x, y1 + 1) && tileH(layout, x, y1 + 1) === z) y1++;
        const col = hexNum(shade(paper, -26));
        const capCol = hexNum(shade(paper, -8));
        const A = iso(x, y, capZ);
        const B = iso(x, y1 + 1, capZ);
        const C = iso(x, y1 + 1, z);
        const D = iso(x, y, z);
        fillQuad([A, B, C, D], col);
        fillQuad([A, B, iso(x, y1 + 1, capZ - 0.28), iso(x, y, capZ - 0.28)], capCol);
        strokeQuad([A, B, C, D], ink, 1);
        for (let yy = y; yy <= y1; yy++) if (isDoor(layout, x, yy)) punchDoorW(x, yy, z);
        y = y1 + 1;
      }
    }

    for (let y = 0; y < layout.h; y++) {
      let x = 0;
      while (x < layout.w) {
        if (!northWall(x, y)) {
          x++;
          continue;
        }
        const z = tileH(layout, x, y);
        let x1 = x;
        while (x1 + 1 < layout.w && northWall(x1 + 1, y) && tileH(layout, x1 + 1, y) === z) x1++;
        const col = hexNum(paper);
        const capCol = hexNum(shade(paper, 14));
        const A = iso(x, y, capZ);
        const B = iso(x1 + 1, y, capZ);
        const C = iso(x1 + 1, y, z);
        const D = iso(x, y, z);
        fillQuad([A, B, C, D], col);
        fillQuad([A, B, iso(x1 + 1, y, capZ - 0.28), iso(x, y, capZ - 0.28)], capCol);
        strokeQuad([A, B, C, D], ink, 1);
        for (let xx = x; xx <= x1; xx++) if (isDoor(layout, xx, y) && !westWall(xx, y)) punchDoorN(xx, y, z);
        x = x1 + 1;
      }
    }

    for (const tile of tiles) {
      if (tile.z > 0.05 && !isStair(layout, tile.x, tile.y)) {
        isoBox(g, tile.x, tile.y, 0, 1, 1, tile.z, shade(tile.fill, -18), shade(tile.fill, -40), shade(tile.fill, -28));
      }
      const east = !isFloor(tile.x + 1, tile.y);
      const south = !isFloor(tile.x, tile.y + 1);
      const r = iso(tile.x + 1, tile.y, tile.z);
      const b = iso(tile.x + 1, tile.y + 1, tile.z);
      const l = iso(tile.x, tile.y + 1, tile.z);
      if (east) fillQuad([r, b, { sx: b.sx, sy: b.sy + EDGE }, { sx: r.sx, sy: r.sy + EDGE }], hexNum(shade(tile.fill, -42)));
      if (south) fillQuad([l, b, { sx: b.sx, sy: b.sy + EDGE }, { sx: l.sx, sy: l.sy + EDGE }], hexNum(shade(tile.fill, -28)));
    }
    for (const tile of tiles) {
      const A = iso(tile.x, tile.y, tile.z);
      const B = iso(tile.x + 1, tile.y, tile.z);
      const C = iso(tile.x + 1, tile.y + 1, tile.z);
      const D = iso(tile.x, tile.y + 1, tile.z);
      fillQuad([A, B, C, D], hexNum(tile.fill));
    }
    for (const tile of tiles) {
      const A = iso(tile.x, tile.y, tile.z);
      const B = iso(tile.x + 1, tile.y, tile.z);
      const C = iso(tile.x + 1, tile.y + 1, tile.z);
      const D = iso(tile.x, tile.y + 1, tile.z);
      if (!isFloor(tile.x, tile.y - 1) || tileH(layout, tile.x, tile.y - 1) !== tile.z) line(A, B, ink);
      if (!isFloor(tile.x + 1, tile.y) || tileH(layout, tile.x + 1, tile.y) !== tile.z) line(B, C, ink);
      if (!isFloor(tile.x, tile.y + 1) || tileH(layout, tile.x, tile.y + 1) !== tile.z) line(C, D, ink);
      if (!isFloor(tile.x - 1, tile.y) || tileH(layout, tile.x - 1, tile.y) !== tile.z) line(D, A, ink);
    }
  }

  private textureFor(id: string, canvas: HTMLCanvasElement) {
    const hit = this.tex.get(id);
    if (hit && hit.w === canvas.width && hit.h === canvas.height) return hit.tex;
    const tex = Texture.from(canvas);
    tex.source.scaleMode = "nearest";
    this.tex.set(id, { tex, w: canvas.width, h: canvas.height });
    return tex;
  }

  private plantSprite(
    spr: Sprite,
    node: Container,
    canvas: HTMLCanvasElement,
    def: FurnDef,
    x: number,
    y: number,
    z: number,
    rot: 0 | 1 | 2 | 3,
    wallLift: 0 | 1 | 2 | 3 = 1
  ) {
    const { w, d } = footprint(def, rot);
    if (def.slot === "wall") {
      const lift = 1.05 + wallLift * 1.55;
      const west = rot === 1 || rot === 3;
      const a = iso(x, y, z + lift);
      const b = west ? iso(x, y + Math.max(w, d), z + lift) : iso(x + Math.max(w, d), y, z + lift);
      const wallW = Math.max(16, Math.abs(b.sx - a.sx) || Math.max(w, d) * (TW / 2));
      const s = wallW / Math.max(1, canvas.width);
      spr.anchor.set(0.5, 0.55);
      spr.scale.set(s);
      node.position.set(Math.round((a.sx + b.sx) / 2), Math.round((a.sy + b.sy) / 2));
      return;
    }
    const planted = plantFurn(x, y, z, w, d, def.h, canvas.width, canvas.height, visualFill(def));
    const s = planted.destW / Math.max(1, canvas.width);
    spr.anchor.set(0.5, 1);
    spr.scale.set(s);
    node.position.set(planted.x + planted.destW / 2, planted.y + planted.destH);
  }

  private clearFurniture() {
    for (const [, node] of this.furnN) node.destroy({ children: true });
    this.furnN.clear();
    this.furnKind.clear();
    this.ghostSpr.visible = false;
  }

  private clearAvatars() {
    for (const [, spr] of this.avG) spr.destroy({ children: true });
    this.avG.clear();
    this.avKey.clear();
    for (const [, label] of this.names) label.destroy();
    this.names.clear();
  }

  private paintFurniture(room: Room, layout: Layout, sprites?: Record<string, HTMLCanvasElement>) {
    const seen = new Set<string>();
    for (const p of room.furniture) {
      const def = furn(p.catalogId);
      if (!def) continue;
      const { w, d } = footprint(def, p.rot);
      const z = tileH(layout, p.x, p.y);
      const canvas = sprites?.[def.id];
      let node = this.furnN.get(p.uid);
      if (!node) {
        node = new Container();
        this.objects.addChild(node);
        this.furnN.set(p.uid, node);
      }
      if (!canvas) {
        node.visible = false;
        seen.add(p.uid);
        continue;
      }
      const kind = `s:${def.id}:${canvas.width}`;
      if (this.furnKind.get(p.uid) !== kind) {
        node.removeChildren();
        const spr = new Sprite(this.textureFor(def.id, canvas));
        spr.roundPixels = true;
        node.addChild(spr);
        this.furnKind.set(p.uid, kind);
      }
      node.visible = true;
      this.plantSprite(node.children[0] as Sprite, node, canvas, def, p.x, p.y, z, p.rot, p.wallLift ?? 1);
      node.zIndex = (p.x + w / 2 + p.y + d / 2) * 1000 + def.h;
      seen.add(p.uid);
    }
    for (const [uid, node] of this.furnN) {
      if (seen.has(uid)) continue;
      node.destroy({ children: true });
      this.furnN.delete(uid);
      this.furnKind.delete(uid);
    }
  }

  private paintAvatars(room: Room, occupants: Occupant[], layout: Layout) {
    const seen = new Set<string>();
    for (const o of occupants) {
      const sitting = !!o.sitUid && !o.moving && !o.lay;
      const laying = !!o.sitUid && !o.moving && !!o.lay;
      const seat = sitting || laying ? furnAt(room.furniture, Math.round(o.x), Math.round(o.y)) : undefined;
      const seatDef = seat ? furn(seat.catalogId) : undefined;
      const walk: 0 | 1 = o.moving ? 1 : 0;
      const look = getOgCanvas(o.figure, { dir: o.dir, sit: sitting, lay: laying, walk });
      const pose = laying ? "lay" : sitting ? "sit" : "stand";
      const key = `og:${pose}:${look ? look.width : 0}:${JSON.stringify(o.figure)}:${o.dir}`;
      let body = this.avG.get(o.userId);
      if (!look) {
        if (body) body.visible = false;
        seen.add(o.userId);
        continue;
      }
      if (!body || this.avKey.get(o.userId) !== key) {
        body?.destroy({ children: true });
        body = new Container();
        const spr = new Sprite(this.textureFor(key, look));
        spr.anchor.set(0.5, 1);
        spr.roundPixels = true;
        const s = ogScale(look, laying);
        spr.scale.set(s);
        body.addChild(spr);
        this.objects.addChild(body);
        this.avG.set(o.userId, body);
        this.avKey.set(o.userId, key);
      }
      body.visible = true;
      const restH = (sitting || laying) && seatDef ? seatZ(seatDef) : 0;
      const p = iso(o.x + 0.5, o.y + 0.5, tileH(layout, Math.round(o.x), Math.round(o.y)) + restH);
      body.x = Math.round(p.sx);
      body.y = Math.round(p.sy);
      const fp = seatDef && seat ? footprint(seatDef, seat.rot) : { w: 1, d: 1 };
      body.zIndex =
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
      const bodyH = body.children[0] ? Math.abs((body.children[0] as Sprite).height) : 62;
      label.x = Math.round(p.sx - label.width / 2);
      label.y = Math.round(p.sy - bodyH - 12);
      label.zIndex = body.zIndex + 1;
    }
    for (const [id, spr] of this.avG) {
      if (seen.has(id)) continue;
      spr.destroy();
      this.avG.delete(id);
      this.avKey.delete(id);
      this.names.get(id)?.destroy();
      this.names.delete(id);
    }
  }

  private paintGhost(frame: PixiFrame, layout: Layout) {
    const g = this.ghost;
    g.clear();
    this.ghostSpr.visible = false;
    if (frame.hover && walkable(layout, frame.hover.x, frame.hover.y)) {
      isoDiamond(g, frame.hover.x, frame.hover.y, tileH(layout, frame.hover.x, frame.hover.y), "#14F195");
      g.alpha = 0.35;
    }
  }

  destroy() {
    this.ready = false;
    this.app?.destroy({ removeView: true });
    this.app = null;
    this.furnN.clear();
    this.furnKind.clear();
    this.tex.clear();
    this.avG.clear();
    this.avKey.clear();
    this.names.clear();
  }
}
