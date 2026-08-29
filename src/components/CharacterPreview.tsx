"use client";

import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/types";
import {
  botsFor,
  clampFigure,
  COLOR_N,
  drawAvatarFront,
  hairsFor,
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

function Thumb({
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
      className={`overflow-hidden rounded-xl border-2 bg-[#3d4a55] ${on ? "border-[#14F195] ring-2 ring-[#14F195]" : "border-transparent hover:border-white/30"}`}
    >
      <img src={src(id)} alt="" className="h-16 w-12 object-contain sm:h-20 sm:w-14" style={{ imageRendering: "pixelated" }} />
    </button>
  );
}

const TABS = ["skin", "hair", "top", "bot", "shoe"] as const;

function TabIcon({ tab, on }: { tab: (typeof TABS)[number]; on: boolean }) {
  const c = on ? "#12121c" : "#ffffffcc";
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill={c} aria-hidden>
      {tab === "skin" && <circle cx="16" cy="12" r="7" />}
      {tab === "skin" && <path d="M8 28c1-7 4-10 8-10s7 3 8 10" />}
      {tab === "hair" && <path d="M8 18c0-8 3.5-14 8-14s8 6 8 14c0 2-1 4-3 4H11c-2 0-3-2-3-4Z" />}
      {tab === "top" && <path d="M10 8 16 12l6-4 4 4-3 3v11H9V15L6 12l4-4Z" />}
      {tab === "bot" && <path d="M10 8h12l-1 6-2 14h-3l-2-10-2 10h-3L11 14 10 8Z" />}
      {tab === "shoe" && <path d="M6 18h9l3 8H6l0-8Zm12 0h8l2 8h-9l-1-8Z" />}
    </svg>
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
  useEffect(() => {
    let live = true;
    const draw = () => {
      const c = ref.current;
      if (!c || !live) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#6f7f8c";
      ctx.fillRect(0, 0, size, size);
      drawAvatarFront(ctx, clampFigure(figure), size / 2, size * 0.96, Math.max(5.5, size / 36), dir);
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
  const g = gKey(f.gender ?? 0);
  const hairs = hairsFor(f.gender ?? 0);
  const tops = topsFor(f.gender ?? 0);
  const bots = botsFor(f.gender ?? 0);
  const shoes = shoesFor(f.gender ?? 0);
  const hairN = g === "f" ? 6 : 6;
  const push = (patch: Partial<Figure>) => onChange(clampFigure({ ...f, face: 0, ...patch }));

  let picks: { id: string; on: boolean; click: () => void }[] = [];
  if (tab === "skin") {
    picks = Array.from({ length: 8 }, (_, i) => ({
      id: `${g}-skin-${i}`,
      on: f.skin === i,
      click: () => push({ skin: i }),
    }));
  } else if (tab === "hair") {
    picks = [
      ...hairs.map((name, i) => ({
        id: `${g}-hair-${name}-${f.hairColor}`,
        on: f.hair === i,
        click: () => push({ hair: i }),
      })),
      ...Array.from({ length: hairN }, (_, i) => ({
        id: `${g}-hair-${hairs[f.hair] || hairs[0]}-${i}`,
        on: f.hairColor === i,
        click: () => push({ hairColor: i }),
      })),
    ];
  } else if (tab === "top") {
    picks = [
      ...tops.map((name, i) => ({
        id: `${g}-top-${name}-${f.top}`,
        on: (f.topCut ?? 0) === i,
        click: () => push({ topCut: i }),
      })),
      ...Array.from({ length: COLOR_N }, (_, i) => ({
        id: `${g}-top-${tops[f.topCut ?? 0] || tops[0]}-${i}`,
        on: f.top === i,
        click: () => push({ top: i }),
      })),
    ];
  } else if (tab === "bot") {
    picks = [
      ...bots.map((name, i) => ({
        id: `${g}-bot-${name}-${f.bottom}`,
        on: (f.botCut ?? 0) === i,
        click: () => push({ botCut: i }),
      })),
      ...Array.from({ length: COLOR_N }, (_, i) => ({
        id: `${g}-bot-${bots[f.botCut ?? 0] || bots[0]}-${i}`,
        on: f.bottom === i,
        click: () => push({ bottom: i }),
      })),
    ];
  } else {
    picks = [
      ...shoes.map((name, i) => ({
        id: `${g}-shoe-${name}-${f.shoes}`,
        on: (f.shoeCut ?? 0) === i,
        click: () => push({ shoeCut: i }),
      })),
      ...Array.from({ length: COLOR_N }, (_, i) => ({
        id: `${g}-shoe-${shoes[f.shoeCut ?? 0] || shoes[0]}-${i}`,
        on: f.shoes === i,
        click: () => push({ shoes: i }),
      })),
    ];
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#120e1c]/80 text-white shadow-xl">
      <div className="flex justify-center gap-2 p-3">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => push({ gender: i, hair: 0, topCut: 0, botCut: 0, shoeCut: 0, face: 0 })}
            className={`overflow-hidden rounded-2xl border-2 ${(f.gender ?? 0) === i ? "border-[#14F195] ring-2 ring-[#14F195]" : "border-transparent"}`}
          >
            <img src={src(`${gKey(i)}-skin-2`)} alt="" className="h-20 w-14 object-contain bg-[#3d4a55]" style={{ imageRendering: "pixelated" }} />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-3 pt-0 md:flex-row md:items-start">
        <div className="mx-auto w-[min(240px,100%)] shrink-0 md:mx-0">
          <div className="overflow-hidden rounded-2xl bg-[#6f7f8c]">
            <CharacterPreview figure={f} size={240} dir={1} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex justify-center gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                aria-label={t}
                onClick={() => setTab(t)}
                className={`grid h-11 w-11 place-items-center rounded-xl ${tab === t ? "bg-[#14F195]" : "bg-white/10 hover:bg-white/15"}`}
              >
                <TabIcon tab={t} on={tab === t} />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {picks.map((p) => (
              <Thumb key={p.id + String(p.on)} id={p.id} on={p.on} onClick={p.click} />
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
