"use client";

import { useEffect, useRef } from "react";
import { furn, footprint } from "@/lib/catalog";
import { drawFurniture } from "@/lib/game/draw";
import { iso, TW, TH, ZH } from "@/lib/game/iso";
import { loadSprite } from "@/lib/game/sprites";

export function FurnIcon({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;
    const paint = (sprites: Record<string, HTMLCanvasElement> = {}) => {
      const c = ref.current;
      if (!alive || !c) return;
      const def = furn(id);
      if (!def) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const W = 160;
      const H = 140;
      c.width = W;
      c.height = H;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#8fd4f2";
      ctx.fillRect(0, 0, W, H);
      const { w, d } = footprint(def, 0);
      const spanX = ((w + d) * TW) / 2 + 8;
      const spanY = ((w + d) * TH) / 2 + def.h * ZH + 24;
      const scale = Math.min(0.95, (W - 16) / spanX, (H - 20) / spanY);
      const foot = iso(w, d);
      ctx.setTransform(scale, 0, 0, scale, W / 2 - foot.sx * scale, H * 0.9 - foot.sy * scale);
      drawFurniture(
        ctx,
        def,
        { uid: "icon", catalogId: id, x: 0, y: 0, rot: 0, ownerId: "" },
        0.4,
        sprites
      );
    };
    paint({});
    loadSprite(id).then((spr) => {
      if (!alive || !spr) return;
      paint({ [id]: spr });
    });
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <canvas
      ref={ref}
      width={160}
      height={140}
      className={className}
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    />
  );
}
