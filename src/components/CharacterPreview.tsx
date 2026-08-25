"use client";

import { useEffect, useRef } from "react";
import type { Figure } from "@/lib/types";
import {
  ACC,
  BOTTOMS,
  BOT_CUTS,
  clampFigure,
  drawAvatarFront,
  HAIR_C,
  HAIR_STYLES,
  SHOES,
  SKIN,
  TOP_CUTS,
  TOPS,
} from "@/lib/game/avatar";

export function CharacterPreview({ figure, size = 220 }: { figure: Figure; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#8ee0c4";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#4db7ea";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(size / 2, 40 + i * 18);
      ctx.lineTo(size / 2 + 36, 58 + i * 18);
      ctx.lineTo(size / 2, 76 + i * 18);
      ctx.lineTo(size / 2 - 36, 58 + i * 18);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? "#4db7ea" : "#3aa6dc";
      ctx.fill();
    }
    drawAvatarFront(ctx, clampFigure(figure), size / 2, size * 0.62, size / 110);
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
          value={Number(f[key] ?? 0)}
          className="w-full"
          onChange={(e) => onChange({ ...f, [key]: Number(e.target.value) })}
        />
        {swatches ? (
          <span className="h-5 w-5 rounded-md border border-white/20" style={{ background: swatches[Number(f[key] ?? 0)] }} />
        ) : (
          <span className="w-16 text-right text-white/80">
            {key === "hair"
              ? HAIR_STYLES[f.hair]
              : key === "acc"
                ? ACC[f.acc]
                : key === "topCut"
                  ? TOP_CUTS[f.topCut ?? 0]
                  : key === "botCut"
                    ? BOT_CUTS[f.botCut ?? 0]
                    : f[key]}
          </span>
        )}
      </div>
    </label>
  );

  return (
    <div className="grid gap-3">
      {row("Skin", "skin", SKIN.length - 1, SKIN)}
      {row("Hair style", "hair", HAIR_STYLES.length - 1)}
      {row("Hair color", "hairColor", HAIR_C.length - 1, HAIR_C)}
      {row("Top color", "top", TOPS.length - 1, TOPS)}
      {row("Shirt", "topCut", TOP_CUTS.length - 1)}
      {row("Bottom color", "bottom", BOTTOMS.length - 1, BOTTOMS)}
      {row("Pants", "botCut", BOT_CUTS.length - 1)}
      {row("Shoes", "shoes", SHOES.length - 1, SHOES)}
      {row("Extra", "acc", ACC.length - 1)}
    </div>
  );
}
