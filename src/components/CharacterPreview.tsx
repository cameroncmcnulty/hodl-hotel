"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  BOTTOMS,
  botsFor,
  clampFigure,
  drawAvatarFront,
  EYE_LABEL,
  EYES,
  facesFor,
  GENDERS,
  HAIR_C,
  hairsFor,
  loadAvatars,
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
      className="grid h-10 w-9 shrink-0 place-items-center rounded-md bg-[#c9c9c9] text-[#333] shadow-inner hover:bg-white active:bg-[#bbb]"
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
      {kind === "face" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <circle cx="12" cy="12" r="8" fill="#f0c3a0" stroke="#222" strokeWidth="1" />
          <circle cx="9" cy="11" r="1.4" fill={color} />
          <circle cx="15" cy="11" r="1.4" fill={color} />
          <path d="M9 16c1 1 5 1 6 0" fill="none" stroke="#222" strokeWidth="1" />
        </svg>
      )}
    </span>
  );
}

export function CharacterPreview({
  figure,
  size = 260,
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
    ctx.fillStyle = "#6f7f8c";
    ctx.fillRect(0, 0, size, size);
    drawAvatarFront(ctx, clampFigure(figure), size / 2, size * 0.96, Math.max(5.5, size / 36), dir);
  }, [figure, size, tick, dir]);
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="mx-auto block max-h-[46vh] w-full max-w-[280px] rounded-md"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function EditorRow({
  kind,
  color,
  label,
  swatch,
  onStylePrev,
  onStyleNext,
  onColorPrev,
  onColorNext,
  stripe,
}: {
  kind: string;
  color: string;
  label: string;
  swatch: string;
  onStylePrev: () => void;
  onStyleNext: () => void;
  onColorPrev: () => void;
  onColorNext: () => void;
  stripe: boolean;
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 sm:gap-2 sm:px-3 ${stripe ? "bg-[#e6e6e6]" : "bg-[#f3f3f3]"}`}>
      <ArrowBtn label="prev" onClick={onStylePrev} />
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <PartIcon kind={kind} color={color} />
        <span className="hidden min-w-0 truncate text-xs font-bold capitalize text-[#333] sm:inline">{label}</span>
      </div>
      <ArrowBtn label="next" onClick={onStyleNext} />
      <div className="mx-1 h-8 w-px bg-black/15" />
      <ArrowBtn label="prev" onClick={onColorPrev} />
      <span className="h-10 w-10 shrink-0 rounded-md border border-black/30" style={{ background: swatch }} />
      <ArrowBtn label="next" onClick={onColorNext} />
    </div>
  );
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure(figure);
  const [dirI, setDirI] = useState(0);
  const dir = DIRS[dirI];
  const hairs = hairsFor(f.gender ?? 0);
  const tops = topsFor(f.gender ?? 0);
  const bots = botsFor(f.gender ?? 0);
  const faces = facesFor(f.gender ?? 0);
  const cycle = (key: keyof Figure, max: number, delta: number) => {
    onChange({ ...f, [key]: wrap(Number(f[key] ?? 0) + delta, max) });
  };
  const setGender = (i: number) => {
    onChange({ ...f, gender: i, hair: 0, topCut: 0, botCut: 0, face: 0 });
  };

  const rows = [
    {
      kind: "hair",
      color: HAIR_C[f.hairColor],
      label: hairs[f.hair] || "hair",
      swatch: HAIR_C[f.hairColor],
      stylePrev: () => cycle("hair", hairs.length - 1, -1),
      styleNext: () => cycle("hair", hairs.length - 1, 1),
      colorPrev: () => cycle("hairColor", HAIR_C.length - 1, -1),
      colorNext: () => cycle("hairColor", HAIR_C.length - 1, 1),
    },
    {
      kind: "face",
      color: EYES[f.eyes ?? 0],
      label: `${faces[f.face ?? 0] || "oval"} · ${EYE_LABEL[f.eyes ?? 0]}`,
      swatch: EYES[f.eyes ?? 0],
      stylePrev: () => cycle("face", faces.length - 1, -1),
      styleNext: () => cycle("face", faces.length - 1, 1),
      colorPrev: () => cycle("eyes", EYES.length - 1, -1),
      colorNext: () => cycle("eyes", EYES.length - 1, 1),
    },
    {
      kind: "skin",
      color: SKIN[f.skin],
      label: "skin",
      swatch: SKIN[f.skin],
      stylePrev: () => cycle("skin", SKIN.length - 1, -1),
      styleNext: () => cycle("skin", SKIN.length - 1, 1),
      colorPrev: () => cycle("skin", SKIN.length - 1, -1),
      colorNext: () => cycle("skin", SKIN.length - 1, 1),
    },
    {
      kind: "shirt",
      color: TOPS[f.top],
      label: tops[f.topCut ?? 0] || "top",
      swatch: TOPS[f.top],
      stylePrev: () => cycle("topCut", tops.length - 1, -1),
      styleNext: () => cycle("topCut", tops.length - 1, 1),
      colorPrev: () => cycle("top", TOPS.length - 1, -1),
      colorNext: () => cycle("top", TOPS.length - 1, 1),
    },
    {
      kind: "pants",
      color: BOTTOMS[f.bottom],
      label: bots[f.botCut ?? 0] || "pants",
      swatch: BOTTOMS[f.bottom],
      stylePrev: () => cycle("botCut", bots.length - 1, -1),
      styleNext: () => cycle("botCut", bots.length - 1, 1),
      colorPrev: () => cycle("bottom", BOTTOMS.length - 1, -1),
      colorNext: () => cycle("bottom", BOTTOMS.length - 1, 1),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#8a8a8a] bg-[#d0d0d0] text-[#222]">
      <div className="flex gap-2 bg-[#3a3a3a] p-2">
        {GENDERS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`flex-1 rounded px-3 py-2 text-sm capitalize ${
              (f.gender ?? 0) === i ? "bg-[#14F195] font-bold text-[#111]" : "bg-[#555] text-white"
            }`}
            onClick={() => setGender(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[#6f7f8c] px-3 pb-2 pt-3">
        <CharacterPreview figure={f} size={280} dir={dir} />
        <div className="mt-2 flex items-center justify-center gap-2">
          <ArrowBtn label="prev" onClick={() => setDirI((i) => wrap(i - 1, DIRS.length - 1))} />
          <span className="min-w-[64px] text-center text-xs font-bold uppercase tracking-wide text-white">
            {dir === 1 || dir === 0 ? "Front" : "Back"}
          </span>
          <ArrowBtn label="next" onClick={() => setDirI((i) => wrap(i + 1, DIRS.length - 1))} />
        </div>
        <p className="mt-1 text-center text-[10px] text-white/80">
          {hairs[f.hair]} · {faces[f.face ?? 0]} · {EYE_LABEL[f.eyes ?? 0]} · {tops[f.topCut ?? 0]} · {bots[f.botCut ?? 0]}
        </p>
      </div>

      <div>
        {rows.map((row, i) => (
          <EditorRow
            key={row.kind}
            kind={row.kind}
            color={row.color}
            label={row.label}
            swatch={row.swatch}
            onStylePrev={row.stylePrev}
            onStyleNext={row.styleNext}
            onColorPrev={row.colorPrev}
            onColorNext={row.colorNext}
            stripe={i % 2 === 1}
          />
        ))}
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
