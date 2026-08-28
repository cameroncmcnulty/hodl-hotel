"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  BOTTOMS,
  botsFor,
  clampFigure,
  drawAvatarFront,
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

function ArrowBtn({ dir, label, onClick }: { dir: "prev" | "next"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:bg-[#14F195] active:text-[#12121c]"
    >
      {dir === "prev" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}

function PartIcon({ kind, color }: { kind: string; color: string }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10" aria-hidden>
      {kind === "hair" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M6 14c0-6 3-11 6-11s6 5 6 11c0 2-1 3-3 3H9c-2 0-3-1-3-3z" fill={color} stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
        </svg>
      )}
      {kind === "skin" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <circle cx="12" cy="10" r="6" fill={color} />
          <ellipse cx="12" cy="20" rx="5" ry="3" fill={color} />
        </svg>
      )}
      {kind === "shirt" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 8l5-3 3 2 3-2 5 3-2 4v8H6V12L4 8z" fill={color} stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
        </svg>
      )}
      {kind === "pants" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 4h10l-1 6-2 10H13l-1-8-1 8H10L8 10 7 4z" fill={color} stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
        </svg>
      )}
      {kind === "face" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <circle cx="12" cy="12" r="8" fill="#f0c3a0" />
          <circle cx="9" cy="11" r="1.4" fill={color} />
          <circle cx="15" cy="11" r="1.4" fill={color} />
          <path d="M9 16c1 1 5 1 6 0" fill="none" stroke="#333" strokeWidth="1.2" />
        </svg>
      )}
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
    <div className="flex flex-wrap gap-1.5" role="listbox" aria-label={label}>
      {colors.map((c, i) => (
        <button
          key={`${c}-${i}`}
          type="button"
          role="option"
          aria-selected={i === value}
          aria-label={`${label} ${i + 1}`}
          onClick={() => onChange(i)}
          className={`h-7 w-7 rounded-full border-2 transition ${
            i === value ? "scale-110 border-white shadow-[0_0_0_2px_rgba(20,241,149,0.7)]" : "border-white/15 hover:border-white/40"
          }`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function Stepper({
  kind,
  color,
  index,
  total,
  onPrev,
  onNext,
  label,
}: {
  kind: string;
  color: string;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <ArrowBtn dir="prev" label={`Previous ${label}`} onClick={onPrev} />
      <PartIcon kind={kind} color={color} />
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-[#14F195]" : "bg-white/25"}`} />
        ))}
      </div>
      <ArrowBtn dir="next" label={`Next ${label}`} onClick={onNext} />
    </div>
  );
}

function OptionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/[0.06] px-3 py-2.5">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{title}</h3>
      <div className="grid gap-2.5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 shrink-0 text-[11px] font-medium text-white/40">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
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
  const set = (key: keyof Figure, value: number) => {
    onChange({ ...f, [key]: value });
  };
  const setGender = (i: number) => {
    onChange({ ...f, gender: i, hair: 0, topCut: 0, botCut: 0, face: 0 });
  };

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
            onClick={() => setGender(i)}
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

        <div className="min-w-0 flex-1 space-y-2">
          <OptionCard title="Hair">
            <Field label="Style">
              <Stepper
                kind="hair"
                color={HAIR_C[f.hairColor]}
                index={f.hair}
                total={hairs.length}
                label="hairstyle"
                onPrev={() => cycle("hair", hairs.length - 1, -1)}
                onNext={() => cycle("hair", hairs.length - 1, 1)}
              />
            </Field>
            <Field label="Color">
              <ColorDots colors={HAIR_C} value={f.hairColor} onChange={(i) => set("hairColor", i)} label="Hair color" />
            </Field>
          </OptionCard>

          <OptionCard title="Face">
            <Field label="Look">
              <Stepper
                kind="face"
                color={EYES[f.eyes ?? 0]}
                index={f.face ?? 0}
                total={faces.length}
                label="face"
                onPrev={() => cycle("face", faces.length - 1, -1)}
                onNext={() => cycle("face", faces.length - 1, 1)}
              />
            </Field>
            <Field label="Eyes">
              <ColorDots colors={EYES} value={f.eyes ?? 0} onChange={(i) => set("eyes", i)} label="Eye color" />
            </Field>
          </OptionCard>

          <OptionCard title="Skin">
            <Field label="Color">
              <ColorDots colors={SKIN} value={f.skin} onChange={(i) => set("skin", i)} label="Skin color" />
            </Field>
          </OptionCard>

          <OptionCard title="Shirt">
            <Field label="Style">
              <Stepper
                kind="shirt"
                color={TOPS[f.top]}
                index={f.topCut ?? 0}
                total={tops.length}
                label="shirt"
                onPrev={() => cycle("topCut", tops.length - 1, -1)}
                onNext={() => cycle("topCut", tops.length - 1, 1)}
              />
            </Field>
            <Field label="Color">
              <ColorDots colors={TOPS} value={f.top} onChange={(i) => set("top", i)} label="Shirt color" />
            </Field>
          </OptionCard>

          <OptionCard title="Pants">
            <Field label="Style">
              <Stepper
                kind="pants"
                color={BOTTOMS[f.bottom]}
                index={f.botCut ?? 0}
                total={bots.length}
                label="pants"
                onPrev={() => cycle("botCut", bots.length - 1, -1)}
                onNext={() => cycle("botCut", bots.length - 1, 1)}
              />
            </Field>
            <Field label="Color">
              <ColorDots colors={BOTTOMS} value={f.bottom} onChange={(i) => set("bottom", i)} label="Pants color" />
            </Field>
          </OptionCard>
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
