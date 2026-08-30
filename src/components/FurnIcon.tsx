"use client";

import { useEffect, useRef } from "react";
import { furn } from "@/lib/catalog";
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
        const b = g.getLocalBounds();
        const scale = Math.min(144 / Math.max(8, b.width), 124 / Math.max(8, b.height));
        g.scale.set(scale);
        g.position.set(80 - (b.x + b.width / 2) * scale, 70 - (b.y + b.height / 2) * scale);
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
