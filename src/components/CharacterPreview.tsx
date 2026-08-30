"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  avatarsReady,
  clampFigure,
  drawAvatarFront,
  loadAvatars,
  LOOK_H,
  LOOK_N,
  LOOK_W,
  lookKey,
} from "@/lib/game/avatar";

function LookThumb({
  figure,
  on,
  onClick,
  scale = 1,
  label,
  ready,
}: {
  figure: Figure;
  on: boolean;
  onClick: () => void;
  scale?: number;
  label?: string;
  ready?: boolean;
}) {
  const f = clampFigure(figure);
  const s = Math.max(1, Math.round(scale));
  const w = LOOK_W * s;
  const h = LOOK_H * s;
  const ref = useRef<HTMLCanvasElement>(null);
  const key = lookKey(f);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#2a3340";
    ctx.fillRect(0, 0, w, h);
    drawAvatarFront(ctx, f, w / 2, h - 4, s, 1);
  }, [key, s, w, h, ready]);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl bg-[#2a3340] ${
        on ? "ring-2 ring-[#14F195] ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-white/10 hover:ring-white/30"
      }`}
    >
      <canvas ref={ref} width={w} height={h} style={{ imageRendering: "pixelated", display: "block", maxWidth: "100%", height: "auto" }} />
      {label ? <span className="block bg-[#1a1428] py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-white/80">{label}</span> : null}
    </button>
  );
}

export function CharacterPreview({
  figure,
  scale = 2,
  dir = 1,
}: {
  figure: Figure;
  size?: number;
  scale?: number;
  dir?: 0 | 1 | 2 | 3;
}) {
  const f = clampFigure(figure);
  const s = Math.max(1, Math.round(scale));
  const w = LOOK_W * s;
  const h = LOOK_H * s;
  const ref = useRef<HTMLCanvasElement>(null);
  const key = lookKey(f, { view: dir });
  const [ready, setReady] = useState(avatarsReady());
  useEffect(() => {
    loadAvatars().then(() => setReady(true));
  }, []);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#5c6b78";
    ctx.fillRect(0, 0, w, h);
    drawAvatarFront(ctx, f, w / 2, h - 8, s, dir);
  }, [key, s, w, h, dir, ready]);
  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className="mx-auto block"
      style={{ imageRendering: "pixelated", width: "100%", height: "auto" }}
    />
  );
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure(figure);
  const [dir, setDir] = useState<0 | 1 | 2 | 3>(1);
  const [ready, setReady] = useState(avatarsReady());
  useEffect(() => {
    loadAvatars().then(() => setReady(true));
  }, []);
  const g = f.gender ?? 0;
  const look = f.look ?? 0;
  const push = (patch: Partial<Figure>) => onChange(clampFigure({ ...f, ...patch }));

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1a1428] p-4 text-white shadow-2xl">
      <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-white/80">Select your character</h2>
      <div className="mb-4 flex justify-center gap-4">
        {[
          { i: 0, label: "Boy" },
          { i: 1, label: "Girl" },
        ].map(({ i, label }) => (
          <LookThumb
            key={`gender-${i}`}
            scale={1}
            label={label}
            ready={ready}
            figure={{ ...f, gender: i, look: 0 }}
            on={g === i}
            onClick={() => push({ gender: i, look: 0 })}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(192px,220px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl bg-[#5c6b78]">
          <CharacterPreview figure={f} scale={2} dir={dir} />
          <div className="flex items-center justify-center gap-3 pb-3">
            <button
              type="button"
              onClick={() => setDir((((dir + 3) % 4) as 0 | 1 | 2 | 3))}
              className="rounded-full bg-black/30 px-3 py-1 text-sm font-bold text-white hover:bg-black/50"
            >
              ◀
            </button>
            <span className="min-w-14 text-center text-[11px] font-bold uppercase tracking-widest text-white/80">
              {["SW", "SE", "NE", "NW"][dir]}
            </span>
            <button
              type="button"
              onClick={() => setDir((((dir + 1) % 4) as 0 | 1 | 2 | 3))}
              className="rounded-full bg-black/30 px-3 py-1 text-sm font-bold text-white hover:bg-black/50"
            >
              ▶
            </button>
          </div>
        </div>
        <div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Pick a character</p>
          <div className="grid max-h-[32rem] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {Array.from({ length: LOOK_N }, (_, i) => (
              <LookThumb
                key={`look-${g}-${i}`}
                scale={1}
                ready={ready}
                figure={{ ...f, gender: g, look: i }}
                on={look === i}
                onClick={() => push({ look: i })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LookStudio({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  return <FigureEditor figure={figure} onChange={onChange} />;
}
