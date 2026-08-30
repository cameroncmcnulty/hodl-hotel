"use client";

import { useEffect, useRef } from "react";
import { furn, footprint } from "@/lib/catalog";
import { iso } from "@/lib/game/iso";
import { drawFurni } from "@/lib/game/pixi/pixiArt";
import { Application, Graphics } from "pixi.js";

export function FurnIcon({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    const def = furn(id);
    if (!host || !def) return;
    const app = new Application();
    let dead = false;
    app
      .init({
        width: 160,
        height: 140,
        background: 0x7ec8ea,
        antialias: false,
        roundPixels: true,
        resolution: 1,
      })
      .then(() => {
        if (dead) {
          app.destroy();
          return;
        }
        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.imageRendering = "pixelated";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        host.appendChild(canvas);
        const g = new Graphics();
        drawFurni(g, def, 0, 0, 0, 0);
        const { w, d } = footprint(def, 0);
        const foot = iso(w, d);
        const scale = Math.min(0.85, 120 / Math.max(40, (w + d) * 32 + def.h * 16));
        g.scale.set(scale);
        g.position.set(80 - foot.sx * scale, 122 - foot.sy * scale);
        g.roundPixels = true;
        app.stage.addChild(g);
      });
    return () => {
      dead = true;
      app.destroy({ removeView: true });
    };
  }, [id]);

  return <div ref={ref} className={className} style={{ width: 160, height: 140, imageRendering: "pixelated" }} aria-hidden />;
}
