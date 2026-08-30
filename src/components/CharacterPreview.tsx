"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  botColors,
  botsFor,
  clampFigure,
  drawAvatarFront,
  figureString,
  hairColors,
  hairsFor,
  loadAvatars,
  LOOK_H,
  LOOK_W,
  lookKey,
  shoeColors,
  shoesFor,
  SKIN,
  topColors,
  topsFor,
} from "@/lib/game/avatar";

function LookThumb({
  figure,
  on,
  onClick,
  scale = 1,
  label,
}: {
  figure: Figure;
  on: boolean;
  onClick: () => void;
  scale?: number;
  label?: string;
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
  }, [key, s, w, h]);
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

function Dots({ colors, on, onPick }: { colors: string[]; on: number; onPick: (i: number) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {colors.map((c, i) => (
        <button
          key={`${c}-${i}`}
          type="button"
          aria-label={`Color ${i + 1}`}
          onClick={() => onPick(i)}
          className={`h-7 w-7 rounded-full ${on === i ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-black/50 hover:ring-white/50"}`}
          style={{ background: c }}
        />
      ))}
    </div>
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
  useEffect(() => {
    loadAvatars();
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
  }, [key, s, w, h, dir]);
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

const TABS = [
  { id: "skin", label: "Skin" },
  { id: "hair", label: "Hair" },
  { id: "ch", label: "Shirt" },
  { id: "lg", label: "Pants" },
  { id: "sh", label: "Shoes" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure(figure);
  const [dir, setDir] = useState<0 | 1 | 2 | 3>(1);
  const [tab, setTab] = useState<Tab>("ch");
  useEffect(() => {
    loadAvatars();
  }, []);
  const g = f.gender ?? 0;
  const push = (patch: Partial<Figure>) => onChange(clampFigure({ ...f, ...patch }));

  const hairs = hairsFor(g);
  const tops = topsFor(g);
  const bots = botsFor(g);
  const shoes = shoesFor(g);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1a1428] p-4 text-white shadow-2xl">
      <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-white/80">Wardrobe</h2>
      <div className="mb-4 flex justify-center gap-4">
        {[
          { i: 0, label: "Boy" },
          { i: 1, label: "Girl" },
        ].map(({ i, label }) => (
          <LookThumb
            key={`gender-${i}`}
            scale={1}
            label={label}
            figure={{ ...f, gender: i, hair: 0, topCut: 0, botCut: 0, shoeCut: 0 }}
            on={g === i}
            onClick={() => push({ gender: i, hair: 0, topCut: 0, botCut: 0, shoeCut: 0 })}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(192px,220px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl bg-[#5c6b78]">
          <CharacterPreview figure={f} scale={2} dir={dir} />
          <div className="flex items-center justify-center gap-3 pb-2">
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
          <p className="break-all px-2 pb-3 text-center font-mono text-[10px] leading-tight text-white/55">{figureString(f)}</p>
        </div>
        <div>
          <div className="mb-3 flex flex-wrap justify-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  tab === t.id ? "bg-[#14F195] text-black" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "skin" && (
            <div className="grid gap-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Skin tone</p>
              <Dots colors={SKIN} on={f.skin} onPick={(i) => push({ skin: i })} />
              <div className="grid grid-cols-4 gap-2">
                {SKIN.map((_, i) => (
                  <LookThumb key={`skin-${g}-${i}`} scale={1} figure={{ ...f, skin: i }} on={f.skin === i} onClick={() => push({ skin: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "hair" && (
            <div className="grid gap-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Hair</p>
              <Dots colors={hairColors(g)} on={f.hairColor} onPick={(i) => push({ hairColor: i })} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {hairs.map((name, i) => (
                  <LookThumb
                    key={`hr-${g}-${i}`}
                    scale={1}
                    label={name}
                    figure={{ ...f, hair: i }}
                    on={f.hair === i}
                    onClick={() => push({ hair: i })}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "ch" && (
            <div className="grid gap-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Shirt</p>
              <Dots colors={topColors(g, f.topCut ?? 0)} on={f.top} onPick={(i) => push({ top: i })} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {tops.map((name, i) => (
                  <LookThumb
                    key={`ch-${g}-${i}`}
                    scale={1}
                    label={name}
                    figure={{ ...f, topCut: i }}
                    on={(f.topCut ?? 0) === i}
                    onClick={() => push({ topCut: i })}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "lg" && (
            <div className="grid gap-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Pants</p>
              <Dots colors={botColors(g, f.botCut ?? 0)} on={f.bottom} onPick={(i) => push({ bottom: i })} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {bots.map((name, i) => (
                  <LookThumb
                    key={`lg-${g}-${i}`}
                    scale={1}
                    label={name}
                    figure={{ ...f, botCut: i }}
                    on={(f.botCut ?? 0) === i}
                    onClick={() => push({ botCut: i })}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "sh" && (
            <div className="grid gap-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Shoes</p>
              <Dots colors={shoeColors(g, f.shoeCut ?? 0)} on={f.shoes} onPick={(i) => push({ shoes: i })} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {shoes.map((name, i) => (
                  <LookThumb
                    key={`sh-${g}-${i}`}
                    scale={1}
                    label={name}
                    figure={{ ...f, shoeCut: i }}
                    on={(f.shoeCut ?? 0) === i}
                    onClick={() => push({ shoeCut: i })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LookStudio({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  return <FigureEditor figure={figure} onChange={onChange} />;
}
