"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  botsFor,
  clampFigure,
  COLOR_N,
  drawAvatarFront,
  hairsFor,
  HAIR_COLOR_N,
  loadLookSprites,
  shoesFor,
  SPRITE_V,
  topsFor,
} from "@/lib/game/avatar";

function gKey(gender: number) {
  return gender === 1 ? "f" : "m";
}

function src(id: string) {
  return `/art/look/${id}.png?v=${SPRITE_V}`;
}

const HAIR_DOT: Record<"m" | "f", string[]> = {
  m: ["#8B5A2B", "#5C3317", "#1A1A1A", "#E8D07A", "#C45C26", "#4A2C0A"],
  f: ["#8B5A2B", "#1A1A1A", "#111111", "#E8D07A", "#C45C26", "#FF8FAB"],
};
const TOP_DOT: Record<string, string[]> = {
  "m-hoodie": ["#9A9A9A", "#1E3A8A", "#1A1A1A", "#C41E3A", "#166534"],
  "m-tee": ["#E8B931", "#C41E3A", "#F4F4F6", "#3B82F6", "#1A1A1A"],
  "f-hoodie": ["#FF8FAB", "#7C3AED", "#F4F4F6", "#9A9A9A", "#3B82F6"],
  "f-tee": ["#FF8FAB", "#F4F4F6", "#E8B931", "#C41E3A", "#1A1A1A"],
};
const BOT_DOT: Record<string, string[]> = {
  "m-pants": ["#1A1A1A", "#1E3A5F", "#6D4C2F", "#9A9A9A", "#C4A574"],
  "m-shorts": ["#9A9A9A", "#1E3A5F", "#1A1A1A", "#C41E3A", "#166534"],
  "f-skirt": ["#1E3A8A", "#FF8FAB", "#1A1A1A", "#9A9A9A", "#C41E3A"],
  "f-pants": ["#1A1A1A", "#1E3A5F", "#3B82F6", "#9A9A9A", "#6D4C2F"],
  "f-shorts": ["#FF8FAB", "#1A1A1A", "#F4F4F6", "#1E3A8A", "#9A9A9A"],
};
const SHOE_DOT: Record<string, string[]> = {
  "m-sneakers": ["#C41E3A", "#F4F4F6", "#1A1A1A", "#3B82F6", "#9A9A9A"],
  "f-sneakers": ["#C41E3A", "#F4F4F6", "#1A1A1A", "#FF8FAB", "#3B82F6"],
  "f-flats": ["#FF8FAB", "#C41E3A", "#F4F4F6", "#1A1A1A", "#7C3AED"],
};

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

function Pic({
  id,
  on,
  onClick,
}: {
  id: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[4.5rem] w-14 overflow-hidden rounded-2xl bg-[#2a3340] sm:h-20 sm:w-16 ${
        on ? "ring-2 ring-[#14F195] ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-white/10 hover:ring-white/30"
      }`}
    >
      <img src={src(id)} alt="" className="h-full w-full object-contain" style={{ imageRendering: "pixelated" }} />
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
  size = 280,
  dir = 1,
}: {
  figure: Figure;
  size?: number;
  dir?: 0 | 1 | 2 | 3;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let live = true;
    const draw = () => {
      const c = ref.current;
      if (!c || !live) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#5c6b78";
      ctx.fillRect(0, 0, size, size);
      drawAvatarFront(ctx, clampFigure(figure), size / 2, size * 0.94, Math.max(5.5, size / 34), dir);
    };
    draw();
    loadLookSprites(figure, dir).then(() => {
      if (live) draw();
    });
    return () => {
      live = false;
    };
  }, [figure, dir, size]);
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="mx-auto block rounded-2xl"
      style={{ imageRendering: "pixelated", width: size, height: size, maxWidth: "100%" }}
    />
  );
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure({ ...figure, face: 0 });
  const [tab, setTab] = useState<(typeof TABS)[number]>("skin");
  const g = gKey(f.gender ?? 0) as "m" | "f";
  const hairs = hairsFor(f.gender ?? 0);
  const tops = topsFor(f.gender ?? 0);
  const bots = botsFor(f.gender ?? 0);
  const shoes = shoesFor(f.gender ?? 0);
  const hairName = hairs[f.hair] || hairs[0];
  const topName = tops[f.topCut ?? 0] || tops[0];
  const botName = bots[f.botCut ?? 0] || bots[0];
  const shoeName = shoes[f.shoeCut ?? 0] || shoes[0];
  const push = (patch: Partial<Figure>) => onChange(clampFigure({ ...f, face: 0, ...patch }));

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1a1428] p-4 text-white shadow-2xl">
      <div className="flex justify-center gap-3 pb-4">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => push({ gender: i, hair: 0, topCut: 0, botCut: 0, shoeCut: 0 })}
            className={`overflow-hidden rounded-2xl bg-[#2a3340] ${(f.gender ?? 0) === i ? "ring-2 ring-[#14F195] ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-white/10"}`}
          >
            <img src={src(`${gKey(i)}-skin-2`)} alt="" className="h-24 w-[4.5rem] object-contain" style={{ imageRendering: "pixelated" }} />
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
        <div className="overflow-hidden rounded-2xl bg-[#5c6b78]">
          <CharacterPreview figure={f} size={280} dir={1} />
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
                <Pic key={`skin-${i}`} id={`${g}-skin-${i}`} on={f.skin === i} onClick={() => push({ skin: i })} />
              ))}
            </div>
          )}

          {tab === "hair" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {hairs.map((name, i) => (
                  <Pic key={`hs-${name}`} id={`${g}-hair-${name}-${f.hairColor}`} on={f.hair === i} onClick={() => push({ hair: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {HAIR_DOT[g].slice(0, HAIR_COLOR_N).map((color, i) => (
                  <Dot key={`hc-${i}`} color={color} on={f.hairColor === i} onClick={() => push({ hairColor: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "top" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {tops.map((name, i) => (
                  <Pic key={`ts-${name}`} id={`${g}-top-${name}-${f.top}`} on={(f.topCut ?? 0) === i} onClick={() => push({ topCut: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {(TOP_DOT[`${g}-${topName}`] || TOP_DOT["m-hoodie"]).slice(0, COLOR_N).map((color, i) => (
                  <Dot key={`tc-${i}`} color={color} on={f.top === i} onClick={() => push({ top: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "bot" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {bots.map((name, i) => (
                  <Pic key={`bs-${name}`} id={`${g}-bot-${name}-${f.bottom}`} on={(f.botCut ?? 0) === i} onClick={() => push({ botCut: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {(BOT_DOT[`${g}-${botName}`] || BOT_DOT["m-pants"]).slice(0, COLOR_N).map((color, i) => (
                  <Dot key={`bc-${i}`} color={color} on={f.bottom === i} onClick={() => push({ bottom: i })} />
                ))}
              </div>
            </div>
          )}

          {tab === "shoe" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {shoes.map((name, i) => (
                  <Pic key={`ss-${name}`} id={`${g}-shoe-${name}-${f.shoes}`} on={(f.shoeCut ?? 0) === i} onClick={() => push({ shoeCut: i })} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {(SHOE_DOT[`${g}-${shoeName}`] || SHOE_DOT["m-sneakers"]).slice(0, COLOR_N).map((color, i) => (
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
