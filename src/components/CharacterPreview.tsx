"use client";

import { useEffect, useRef } from "react";
import type { Figure } from "@/lib/types";
import { ACC, BOTTOMS, clampFigure, drawAvatarFront, HAIR_C, HAIR_STYLES, SHOES, SKIN, TOPS } from "@/lib/game/avatar";

export function CharacterPreview({ figure, size = 220 }: { figure: Figure; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(0, 0, size, size);
    drawAvatarFront(ctx, clampFigure(figure), size / 2, size * 0.58, size / 140);
  }, [figure, size]);
  return <canvas ref={ref} width={size} height={size} className="rounded-2xl" />;
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure(figure);
  const row = (label: string, key: keyof Figure, max: number, swatches?: string[]) => (
    <label className="block text-xs uppercase tracking-wide text-white/60">
      {label}
      <div className="mt-1 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={max}
          value={f[key]}
          className="w-full"
          onChange={(e) => onChange({ ...f, [key]: Number(e.target.value) })}
        />
        {swatches ? (
          <span className="h-5 w-5 rounded-md border border-white/20" style={{ background: swatches[f[key]] }} />
        ) : (
          <span className="w-16 text-right text-white/80">{[HAIR_STYLES, ACC][key === "hair" ? 0 : 0] && key === "hair" ? HAIR_STYLES[f.hair] : key === "acc" ? ACC[f.acc] : f[key]}</span>
        )}
      </div>
    </label>
  );

  return (
    <div className="grid gap-3">
      {row("Skin", "skin", SKIN.length - 1, SKIN)}
      {row("Hair style", "hair", HAIR_STYLES.length - 1)}
      {row("Hair color", "hairColor", HAIR_C.length - 1, HAIR_C)}
      {row("Top", "top", TOPS.length - 1, TOPS)}
      {row("Bottoms", "bottom", BOTTOMS.length - 1, BOTTOMS)}
      {row("Shoes", "shoes", SHOES.length - 1, SHOES)}
      {row("Extra", "acc", ACC.length - 1)}
    </div>
  );
}
