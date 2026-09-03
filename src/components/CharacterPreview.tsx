"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  botColors,
  botsFor,
  clampFigure,
  drawLookThumb,
  DYE,
  getLookCanvas,
  hairColors,
  hairsFor,
  ITEM_LABEL,
  lookKey,
  shoeColors,
  shoesFor,
  SKIN,
  THUMB_BOX,
  topColors,
  topsFor,
  type ThumbZone,
} from "@/lib/game/avatar";
import { FOOT_Y, LOOK_H } from "@/lib/game/lookDraw";
import { getTestBody, loadTestBody } from "@/lib/game/testLook";

function SlotThumb({
  figure,
  zone,
  on,
  onClick,
  label,
}: {
  figure: Figure;
  zone: ThumbZone;
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  const f = clampFigure(figure);
  const box = THUMB_BOX[zone];
  const scale = 2;
  const w = box.w * scale;
  const h = box.h * scale;
  const ref = useRef<HTMLCanvasElement>(null);
  const key = lookKey(f);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#24303c";
    ctx.fillRect(0, 0, w, h);
    drawLookThumb(ctx, f, zone, 0, 0, scale);
  }, [key, zone, w, h]);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-xl text-left transition ${
        on ? "ring-2 ring-[#14F195] ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-white/10 hover:ring-white/30"
      }`}
    >
      <canvas ref={ref} width={w} height={h} className="block w-full" style={{ imageRendering: "pixelated", height: "auto" }} />
      <span className="block bg-[#120e1c] px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white/75">{label}</span>
    </button>
  );
}

function Swatches({ colors, on, onPick }: { colors: string[]; on: number; onPick: (i: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c, i) => (
        <button
          key={`${c}-${i}`}
          type="button"
          aria-label={`Color ${i + 1}`}
          onClick={() => onPick(i)}
          className={`h-8 w-8 rounded-full ${on === i ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1428]" : "ring-1 ring-black/40 hover:ring-white/40"}`}
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
  sit = false,
  lay = false,
}: {
  figure: Figure;
  size?: number;
  scale?: number;
  dir?: 0 | 1 | 2 | 3;
  sit?: boolean;
  lay?: boolean;
}) {
  const f = clampFigure(figure);
  const key = lookKey(f, { view: dir, sit, lay });
  const ref = useRef<HTMLCanvasElement>(null);
  const [testReady, setTestReady] = useState(false);
  useEffect(() => {
    let dead = false;
    loadTestBody().then(() => {
      if (!dead) setTestReady(!!getTestBody());
    });
    return () => {
      dead = true;
    };
  }, []);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#5c6b78";
    ctx.fillRect(0, 0, 200, 220);
    const test = getTestBody();
    const look = test || getLookCanvas(f, { view: dir, sit, lay });
    const s = test ? 2 : Math.max(1, Math.round(scale));
    const dw = look.width * s;
    const dh = look.height * s;
    const foot = test ? dh : (FOOT_Y / LOOK_H) * dh;
    ctx.drawImage(look, Math.round(100 - dw / 2), Math.round(190 - foot), dw, dh);
  }, [key, dir, sit, lay, scale, testReady]);
  return (
    <canvas
      ref={ref}
      width={200}
      height={220}
      className="mx-auto block h-[220px] w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

const TABS: { id: "skin" | "hair" | "ch" | "lg" | "sh"; label: string; zone: ThumbZone }[] = [
  { id: "skin", label: "Body", zone: "full" },
  { id: "hair", label: "Hair", zone: "head" },
  { id: "ch", label: "Shirt", zone: "chest" },
  { id: "lg", label: "Pants", zone: "legs" },
  { id: "sh", label: "Shoes", zone: "legs" },
];

function labelOf(name: string) {
  return ITEM_LABEL[name] || name;
}

function shuffleFigure(f: Figure): Figure {
  const g = f.gender ?? 0;
  const pick = (n: number) => Math.floor(Math.random() * n);
  return clampFigure({
    ...f,
    skin: pick(SKIN.length),
    hair: pick(hairsFor(g).length),
    hairColor: pick(hairColors(g).length),
    topCut: pick(topsFor(g).length),
    top: pick(DYE.length),
    botCut: pick(botsFor(g).length),
    bottom: pick(DYE.length),
    shoeCut: pick(shoesFor(g).length),
    shoes: pick(DYE.length),
  });
}

export function FigureEditor({ figure, onChange }: { figure: Figure; onChange: (f: Figure) => void }) {
  const f = clampFigure(figure);
  const [dir, setDir] = useState<0 | 1 | 2 | 3>(1);
  const [pose, setPose] = useState<"stand" | "sit" | "lay">("stand");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hair");
  const g = f.gender ?? 0;
  const push = (patch: Partial<Figure>) => onChange(clampFigure({ ...f, ...patch }));

  const hairs = hairsFor(g);
  const tops = topsFor(g);
  const bots = botsFor(g);
  const shoes = shoesFor(g);
  return (
    <div className="rounded-3xl border border-white/10 bg-[#1a1428] p-4 text-white shadow-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white/80">Your look</h2>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full bg-white/10 text-xs font-bold">
            {["Boy", "Girl"].map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => push({ gender: i })}
                className={`px-3 py-1 ${g === i ? "bg-[#14F195] text-black" : "text-white/70 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange(shuffleFigure(f))}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/20"
          >
            Shuffle
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl bg-[#5c6b78]">
          <CharacterPreview figure={f} scale={2} dir={dir} sit={pose === "sit"} lay={pose === "lay"} />
          <div className="flex items-center justify-center gap-3 pb-3">
            <button
              type="button"
              onClick={() => setDir((((dir + 3) % 4) as 0 | 1 | 2 | 3))}
              className="rounded-full bg-black/30 px-3 py-1 text-sm font-bold text-white hover:bg-black/50"
            >
              ◀
            </button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Turn</span>
            <button
              type="button"
              onClick={() => setDir((((dir + 1) % 4) as 0 | 1 | 2 | 3))}
              className="rounded-full bg-black/30 px-3 py-1 text-sm font-bold text-white hover:bg-black/50"
            >
              ▶
            </button>
          </div>
          <div className="flex items-center justify-center gap-1 pb-3">
            {(["stand", "sit", "lay"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPose(p)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  pose === p ? "bg-[#14F195] text-black" : "bg-black/30 text-white/80 hover:bg-black/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-1">
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Skin</p>
              <Swatches colors={SKIN} on={f.skin} onPick={(i) => push({ skin: i })} />
            </div>
          )}

          {tab === "hair" && (
            <div className="grid gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Color</p>
              <Swatches colors={hairColors(g)} on={f.hairColor} onPick={(i) => push({ hairColor: i })} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Style</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {hairs.map((name, i) => (
                  <SlotThumb
                    key={`hr-${g}-${i}`}
                    zone="head"
                    label={labelOf(name)}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Color</p>
              <Swatches colors={topColors()} on={f.top} onPick={(i) => push({ top: i })} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Style</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tops.map((name, i) => (
                  <SlotThumb
                    key={`ch-${i}`}
                    zone="chest"
                    label={labelOf(name)}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Color</p>
              <Swatches colors={botColors()} on={f.bottom} onPick={(i) => push({ bottom: i })} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Style</p>
              <div className="grid grid-cols-3 gap-2">
                {bots.map((name, i) => (
                  <SlotThumb
                    key={`lg-${g}-${i}`}
                    zone="legs"
                    label={labelOf(name)}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Color</p>
              <Swatches colors={shoeColors()} on={f.shoes} onPick={(i) => push({ shoes: i })} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Style</p>
              <div className="grid grid-cols-3 gap-2">
                {shoes.map((name, i) => (
                  <SlotThumb
                    key={`sh-${i}`}
                    zone="legs"
                    label={labelOf(name)}
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
