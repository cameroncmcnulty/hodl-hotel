"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  botColors,
  botsFor,
  clampFigure,
  drawAvatarFront,
  hairColors,
  hairsFor,
  LOOK_H,
  LOOK_W,
  lookKey,
  shoeColors,
  shoesFor,
  topColors,
  topsFor,
} from "@/lib/game/avatar";

const TABS = ["skin", "hair", "top", "bot", "shoe"] as const;

function TabIcon({ tab, on }: { tab: (typeof TABS)[number]; on: boolean }) {
  const c = on ? "#12121c" : "#e8e4f0";
  return (
    <svg viewBox="0 0 32 32" width="20" height="20" fill={c} aria-hidden>
      {tab === "skin" && (
        <>
          <circle cx="16" cy="11" r="6" />
          <path d="M8 28c1-7 4-10 8-10s7 3 8 10" />
        </>
      )}
      {tab === "hair" && <path d="M8 18c0-8 3.5-14 8-14s8 6 8 14c0 2-1 4-3 4H11c-2 0-3-2-3-4Z" />}
      {tab === "top" && <path d="M10 8 16 12l6-4 4 4-3 3v11H9V15L6 12l4-4Z" />}
      {tab === "bot" && <path d="M10 8h12l-1 6-2 14h-3l-2-10-2 10h-3L11 14 10 8Z" />}
      {tab === "shoe" && <path d="M6 18h9l3 8H6Zm12 0h8l2 8h-9Z" />}
    </svg>
  );
}

function LookThumb({
  figure,
  on,
  onClick,
  scale = 1,
}: {
  figure: Figure;
  on: boolean;
  onClick: () => void;
  scale?: number;
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
    drawAvatarFront(ctx, f, w / 2, h, s, 1);
  }, [key, s, w, h]);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-2xl bg-[#2a3340] ${
        on ? "ring-2 ring-[#14F195] ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-white/10 hover:ring-white/30"
      }`}
    >
      <canvas ref={ref} width={w} height={h} style={{ imageRendering: "pixelated", display: "block" }} />
    </button>
  );
}

function Dot({ color, on, onClick }: { color: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 w-9 rounded-full sm:h-10 sm:w-10 ${on ? "ring-2 ring-[#14F195] ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-white/20"}`}
      style={{ background: color }}
    />
  );
}

export function CharacterPreview({
  figure,
  scale = 4,
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
  const key = lookKey(f, { back: dir === 2 || dir === 3 });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#5c6b78";
    ctx.fillRect(0, 0, w, h);
    drawAvatarFront(ctx, f, w / 2, h, s, dir);
  }, [key, s, w, h, dir]);
  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className="mx-auto block rounded-2xl"
      style={{ imageRendering: "pixelated", maxWidth: "100%", height: "auto" }}
    />
  );
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure({ ...figure, face: 0 });
  const [tab, setTab] = useState<(typeof TABS)[number]>("skin");
  const g = f.gender ?? 0;
  const hairs = hairsFor(g);
  const tops = topsFor(g);
  const bots = botsFor(g);
  const shoes = shoesFor(g);
  const push = (patch: Partial<Figure>) => onChange(clampFigure({ ...f, face: 0, ...patch }));

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1a1428] p-4 text-white shadow-2xl">
      <div className="flex justify-center gap-3 pb-4">
        {[0, 1].map((i) => (
          <LookThumb
            key={`gender-${i}`}
            scale={2}
            figure={{ ...f, gender: i, hair: 0, topCut: 0, botCut: 0, shoeCut: 0 }}
            on={g === i}
            onClick={() => push({ gender: i, hair: 0, topCut: 0, botCut: 0, shoeCut: 0 })}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,192px)_minmax(0,1fr)] md:items-start">
        <div className="overflow-hidden rounded-2xl bg-[#5c6b78]">
          <CharacterPreview figure={f} scale={4} dir={1} />
        </div>
        <div>
          <div className="mb-4 flex justify-center gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                aria-label={t}
                onClick={() => setTab(t)}
                className={`grid h-12 w-12 place-items-center rounded-2xl ${tab === t ? "bg-[#14F195]" : "bg-white/10 hover:bg-white/15"}`}
              >
                <TabIcon tab={t} on={tab === t} />
              </button>
            ))}
          </div>

          {tab === "skin" && (
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <LookThumb key={`skin-${i}`} figure={{ ...f, skin: i }} on={f.skin === i} onClick={() => push({ skin: i })} />
              ))}
            </div>
          )}

          {tab === "hair" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {hairs.map((name, i) => (
                  <LookThumb key={`hs-${name}`} figure={{ ...f, hair: i }} on={f.hair === i} onClick={() => push({ hair: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {hairColors(g).map((color, i) => (
                  <Dot key={`hc-${i}`} color={color} on={f.hairColor === i} onClick={() => push({ hairColor: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "top" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {tops.map((name, i) => (
                  <LookThumb key={`ts-${name}`} figure={{ ...f, topCut: i }} on={(f.topCut ?? 0) === i} onClick={() => push({ topCut: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {topColors(g, f.topCut ?? 0).map((color, i) => (
                  <Dot key={`tc-${i}`} color={color} on={f.top === i} onClick={() => push({ top: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "bot" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {bots.map((name, i) => (
                  <LookThumb key={`bs-${name}`} figure={{ ...f, botCut: i }} on={(f.botCut ?? 0) === i} onClick={() => push({ botCut: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {botColors(g, f.botCut ?? 0).map((color, i) => (
                  <Dot key={`bc-${i}`} color={color} on={f.bottom === i} onClick={() => push({ bottom: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "shoe" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {shoes.map((name, i) => (
                  <LookThumb key={`ss-${name}`} figure={{ ...f, shoeCut: i }} on={(f.shoeCut ?? 0) === i} onClick={() => push({ shoeCut: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {shoeColors(g, f.shoeCut ?? 0).map((color, i) => (
                  <Dot key={`sc-${i}`} color={color} on={f.shoes === i} onClick={() => push({ shoes: i })} />
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
