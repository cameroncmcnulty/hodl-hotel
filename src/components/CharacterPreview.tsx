"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  BOTTOMS,
  botsFor,
  clampFigure,
  drawAvatarFront,
  EYES,
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

function ArrowBtn({ dir, label, onClick }: { dir: "prev" | "next"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:bg-[#14F195] active:text-[#12121c]"
    >
      {dir === "prev" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}

function LookIcon({ kind, color }: { kind: "hair" | "eyes" | "skin" | "shirt" | "pants"; color: string }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10" aria-hidden>
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
        {kind === "hair" && (
          <>
            <path
              d="M8 18.5c0-7.2 3.4-13 8-13s8 5.8 8 13c0 2.2-1.2 3.5-3.2 3.5h-9.6C9.2 22 8 20.7 8 18.5Z"
              fill={color}
            />
            <path
              d="M8 18.5c0-7.2 3.4-13 8-13s8 5.8 8 13c0 2.2-1.2 3.5-3.2 3.5h-9.6C9.2 22 8 20.7 8 18.5Z"
              stroke="#0b0b12"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M11.5 12.5c1.4-1.8 3.2-2.8 4.5-2.8" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
        {kind === "eyes" && (
          <>
            <path d="M6.5 16.5c2.2-3.2 4.8-4.8 7.5-4.8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M18 11.7c2.7 0 5.3 1.6 7.5 4.8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12.2" cy="16.2" r="2.15" fill={color} stroke="#0b0b12" strokeWidth="1.2" />
            <circle cx="19.8" cy="16.2" r="2.15" fill={color} stroke="#0b0b12" strokeWidth="1.2" />
            <circle cx="12.7" cy="15.7" r="0.55" fill="#fff" />
            <circle cx="20.3" cy="15.7" r="0.55" fill="#fff" />
          </>
        )}
        {kind === "skin" && (
          <>
            <circle cx="16" cy="12.2" r="6.2" fill={color} stroke="#0b0b12" strokeWidth="1.4" />
            <path d="M9.2 27c.8-4.6 3.6-7 6.8-7s6 2.4 6.8 7" fill={color} stroke="#0b0b12" strokeWidth="1.4" strokeLinejoin="round" />
          </>
        )}
        {kind === "shirt" && (
          <>
            <path
              d="M10.2 9.2 16 12.2l5.8-3 3.6 3.4-2.4 3.2V25H8.8v-9.2L6.6 12.6l3.6-3.4Z"
              fill={color}
              stroke="#0b0b12"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M16 12.2V25" stroke="#0b0b12" strokeOpacity="0.25" strokeWidth="1.2" />
          </>
        )}
        {kind === "pants" && (
          <>
            <path
              d="M10 7.5h12l-.8 6.2L19.6 26h-3.3l-.8-8.2L14.7 26h-3.3l-1.6-12.3L10 7.5Z"
              fill={color}
              stroke="#0b0b12"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M11.2 14.2h9.6" stroke="#0b0b12" strokeOpacity="0.28" strokeWidth="1.2" />
          </>
        )}
      </svg>
    </span>
  );
}

function ColorDots({
  colors,
  value,
  onChange,
  label,
}: {
  colors: string[];
  value: number;
  onChange: (i: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="listbox" aria-label={label}>
      {colors.map((c, i) => (
        <button
          key={`${c}-${i}`}
          type="button"
          role="option"
          aria-selected={i === value}
          aria-label={`${label} ${i + 1}`}
          onClick={() => onChange(i)}
          className={`h-6 w-6 shrink-0 rounded-full border-2 transition sm:h-7 sm:w-7 ${
            i === value ? "border-white shadow-[0_0_0_2px_#14F195]" : "border-white/20 hover:border-white/50"
          }`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function Stepper({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex w-[88px] items-center justify-between sm:w-[96px]">
      <ArrowBtn dir="prev" label={`Previous ${label}`} onClick={onPrev} />
      <ArrowBtn dir="next" label={`Next ${label}`} onClick={onNext} />
    </div>
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
      className="mx-auto block rounded-2xl"
      style={{ imageRendering: "pixelated", width: size, height: size, maxWidth: "100%" }}
    />
  );
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure({ ...figure, face: 0 });
  const [dirI, setDirI] = useState(0);
  const dir = DIRS[dirI];
  const hairs = hairsFor(f.gender ?? 0);
  const tops = topsFor(f.gender ?? 0);
  const bots = botsFor(f.gender ?? 0);
  const push = (patch: Partial<Figure>) => onChange({ ...f, face: 0, ...patch });
  const cycle = (key: keyof Figure, max: number, delta: number) => {
    push({ [key]: wrap(Number(f[key] ?? 0) + delta, max) });
  };

  const rows: {
    id: "hair" | "eyes" | "skin" | "shirt" | "pants";
    title: string;
    color: string;
    colors: string[];
    value: number;
    onColor: (i: number) => void;
    step?: { onPrev: () => void; onNext: () => void };
  }[] = [
    {
      id: "hair",
      title: "HAIR",
      color: HAIR_C[f.hairColor],
      colors: HAIR_C,
      value: f.hairColor,
      onColor: (i) => push({ hairColor: i }),
      step: {
        onPrev: () => cycle("hair", hairs.length - 1, -1),
        onNext: () => cycle("hair", hairs.length - 1, 1),
      },
    },
    {
      id: "eyes",
      title: "EYES",
      color: EYES[f.eyes ?? 0],
      colors: EYES,
      value: f.eyes ?? 0,
      onColor: (i) => push({ eyes: i }),
    },
    {
      id: "skin",
      title: "SKIN",
      color: SKIN[f.skin],
      colors: SKIN,
      value: f.skin,
      onColor: (i) => push({ skin: i }),
    },
    {
      id: "shirt",
      title: "SHIRT",
      color: TOPS[f.top],
      colors: TOPS,
      value: f.top,
      onColor: (i) => push({ top: i }),
      step: {
        onPrev: () => cycle("topCut", tops.length - 1, -1),
        onNext: () => cycle("topCut", tops.length - 1, 1),
      },
    },
    {
      id: "pants",
      title: "PANTS",
      color: BOTTOMS[f.bottom],
      colors: BOTTOMS,
      value: f.bottom,
      onColor: (i) => push({ bottom: i }),
      step: {
        onPrev: () => cycle("botCut", bots.length - 1, -1),
        onNext: () => cycle("botCut", bots.length - 1, 1),
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#120e1c]/80 text-white shadow-xl">
      <div className="grid grid-cols-2 gap-1 p-2">
        {GENDERS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`rounded-2xl px-3 py-2.5 text-sm capitalize transition ${
              (f.gender ?? 0) === i ? "bg-[#14F195] font-bold text-[#12121c]" : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
            onClick={() => push({ gender: i, hair: 0, topCut: 0, botCut: 0, face: 0 })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 p-3 pt-1 md:flex-row md:items-start md:gap-5 md:p-4">
        <div className="mx-auto w-[min(240px,100%)] shrink-0 md:mx-0 md:w-[260px]">
          <div className="overflow-hidden rounded-2xl bg-[#6f7f8c]">
            <CharacterPreview figure={f} size={260} dir={dir} />
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <ArrowBtn dir="prev" label="Turn left" onClick={() => setDirI((i) => wrap(i - 1, DIRS.length - 1))} />
            <span className="min-w-[72px] text-center text-[11px] font-semibold uppercase tracking-wide text-white/60">
              {dir === 1 || dir === 0 ? "Front" : "Back"}
            </span>
            <ArrowBtn dir="next" label="Turn right" onClick={() => setDirI((i) => wrap(i + 1, DIRS.length - 1))} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="grid items-center gap-x-2 gap-y-3 sm:gap-x-3"
            style={{ gridTemplateColumns: "2.75rem 4.25rem 5.7rem minmax(0,1fr)" }}
          >
            {rows.map((row) => (
              <div key={row.id} className="contents">
                <LookIcon kind={row.id} color={row.color} />
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{row.title}</div>
                <div className="flex justify-center">
                  {row.step ? <Stepper label={row.title} onPrev={row.step.onPrev} onNext={row.step.onNext} /> : <span className="w-[88px] sm:w-[96px]" />}
                </div>
                <ColorDots colors={row.colors} value={row.value} onChange={row.onColor} label={row.title} />
              </div>
            ))}
          </div>
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
