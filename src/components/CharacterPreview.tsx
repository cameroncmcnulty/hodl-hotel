"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  BOTTOMS,
  botsFor,
  clampFigure,
  drawAvatarFront,
  GENDERS,
  HAIR_C,
  hairsFor,
  loadAvatars,
  SHOES,
  SKIN,
  topsFor,
  TOPS,
} from "@/lib/game/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DIRS: (0 | 1 | 2 | 3)[] = [1, 0, 3, 2];

function wrap(v: number, max: number) {
  const n = max + 1;
  return ((v % n) + n) % n;
}

function ArrowBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-8 shrink-0 place-items-center rounded bg-[#c9c9c9] text-[#333] shadow-inner hover:bg-white active:bg-[#bbb]"
    >
      {label === "prev" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}

function PartIcon({ kind, color }: { kind: string; color: string }) {
  return (
    <span
      className="grid h-10 w-10 place-items-center rounded-md border border-black/20 bg-white"
      title={kind}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)" }}
    >
      {kind === "hair" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M6 14c0-6 3-11 6-11s6 5 6 11c0 2-1 3-3 3H9c-2 0-3-1-3-3z" fill={color} stroke="#222" strokeWidth="1" />
          <path d="M8 8c1-2 2-3 4-3" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        </svg>
      )}
      {kind === "skin" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <circle cx="12" cy="10" r="6" fill={color} stroke="#222" strokeWidth="1" />
          <ellipse cx="12" cy="20" rx="5" ry="3" fill={color} stroke="#222" strokeWidth="1" />
        </svg>
      )}
      {kind === "shirt" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 8l5-3 3 2 3-2 5 3-2 4v8H6V12L4 8z" fill={color} stroke="#222" strokeWidth="1" />
        </svg>
      )}
      {kind === "pants" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 4h10l-1 6-2 10H13l-1-8-1 8H10L8 10 7 4z" fill={color} stroke="#222" strokeWidth="1" />
        </svg>
      )}
      {kind === "shoes" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M3 15h12l6 2v3H3v-5z" fill={color} stroke="#222" strokeWidth="1" />
        </svg>
      )}
    </span>
  );
}

export function CharacterPreview({
  figure,
  size = 240,
  dir = 1,
}: {
  figure: Figure;
  size?: number;
  dir?: 0 | 1 | 2 | 3;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    loadAvatars().then(() => setTick((n) => n + 1));
  }, []);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#c5c1b8";
    ctx.fillRect(0, 0, size, size);
    drawAvatarFront(ctx, clampFigure(figure), size / 2, size * 0.94, 5, dir);
  }, [figure, size, tick, dir]);
  return <canvas ref={ref} width={size} height={size} className="rounded-md" style={{ imageRendering: "pixelated" }} />;
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure(figure);
  const [dirI, setDirI] = useState(0);
  const dir = DIRS[dirI];
  const hairs = hairsFor(f.gender ?? 0);
  const tops = topsFor(f.gender ?? 0);
  const bots = botsFor(f.gender ?? 0);
  const cycle = (key: keyof Figure, max: number, delta: number) => {
    onChange({ ...f, [key]: wrap(Number(f[key] ?? 0) + delta, max) });
  };
  const setGender = (i: number) => {
    onChange({ ...f, gender: i, hair: 0, topCut: 0, botCut: 0 });
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#8a8a8a] bg-[#d0d0d0] text-[#222]">
      <div className="flex gap-2 bg-[#3a3a3a] p-2">
        {GENDERS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`flex-1 rounded px-3 py-1 text-sm capitalize ${
              (f.gender ?? 0) === i ? "bg-[#14F195] font-bold text-[#111]" : "bg-[#555] text-white"
            }`}
            onClick={() => setGender(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="grid items-stretch"
        style={{ gridTemplateColumns: "minmax(132px,1fr) minmax(180px,1.2fr) minmax(132px,1fr)" }}
      >
        <div className="grid grid-rows-5">
          {[
            {
              kind: "hair",
              color: HAIR_C[f.hairColor],
              prev: () => cycle("hair", hairs.length - 1, -1),
              next: () => cycle("hair", hairs.length - 1, 1),
              label: hairs[f.hair],
            },
            {
              kind: "skin",
              color: SKIN[f.skin],
              prev: () => cycle("skin", SKIN.length - 1, -1),
              next: () => cycle("skin", SKIN.length - 1, 1),
              label: "skin",
            },
            {
              kind: "shirt",
              color: TOPS[f.top],
              prev: () => cycle("topCut", tops.length - 1, -1),
              next: () => cycle("topCut", tops.length - 1, 1),
              label: tops[f.topCut ?? 0],
            },
            {
              kind: "pants",
              color: BOTTOMS[f.bottom],
              prev: () => cycle("botCut", bots.length - 1, -1),
              next: () => cycle("botCut", bots.length - 1, 1),
              label: bots[f.botCut ?? 0],
            },
            {
              kind: "shoes",
              color: SHOES[f.shoes],
              prev: () => cycle("shoes", SHOES.length - 1, -1),
              next: () => cycle("shoes", SHOES.length - 1, 1),
              label: "shoes",
            },
          ].map((row, i) => (
            <div key={row.kind} className={`flex items-center justify-end gap-1 px-1 py-1.5 ${i % 2 ? "bg-[#e8e8e8]" : "bg-[#f4f4f4]"}`}>
              <ArrowBtn label="prev" onClick={row.prev} />
              <PartIcon kind={row.kind} color={row.color} />
              <ArrowBtn label="next" onClick={row.next} />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center bg-[#cfcfcf] py-2">
          <CharacterPreview figure={f} size={220} dir={dir} />
          <div className="mt-1 flex items-center gap-2">
            <ArrowBtn label="prev" onClick={() => setDirI((i) => wrap(i - 1, DIRS.length - 1))} />
            <span className="min-w-[52px] text-center text-xs font-bold uppercase tracking-wide text-[#333]">
              {dir === 1 || dir === 0 ? "Front" : "Back"}
            </span>
            <ArrowBtn label="next" onClick={() => setDirI((i) => wrap(i + 1, DIRS.length - 1))} />
          </div>
        </div>

        <div className="grid grid-rows-5">
          {[
            { swatch: HAIR_C[f.hairColor], prev: () => cycle("hairColor", HAIR_C.length - 1, -1), next: () => cycle("hairColor", HAIR_C.length - 1, 1) },
            { swatch: SKIN[f.skin], prev: () => cycle("skin", SKIN.length - 1, -1), next: () => cycle("skin", SKIN.length - 1, 1) },
            { swatch: TOPS[f.top], prev: () => cycle("top", TOPS.length - 1, -1), next: () => cycle("top", TOPS.length - 1, 1) },
            { swatch: BOTTOMS[f.bottom], prev: () => cycle("bottom", BOTTOMS.length - 1, -1), next: () => cycle("bottom", BOTTOMS.length - 1, 1) },
            { swatch: SHOES[f.shoes], prev: () => cycle("shoes", SHOES.length - 1, -1), next: () => cycle("shoes", SHOES.length - 1, 1) },
          ].map((row, i) => (
            <div key={i} className={`flex items-center gap-1 px-1 py-1.5 ${i % 2 ? "bg-[#e8e8e8]" : "bg-[#f4f4f4]"}`}>
              <ArrowBtn label="prev" onClick={row.prev} />
              <span className="h-10 w-10 rounded-md border border-black/30" style={{ background: row.swatch }} />
              <ArrowBtn label="next" onClick={row.next} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LookStudio({
  figure,
  onChange,
}: {
  figure: Figure;
  onChange: (f: Figure) => void;
}) {
  return <FigureEditor figure={figure} onChange={onChange} />;
}
