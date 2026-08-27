"use client";

import { useEffect, useState } from "react";

export function PhoneShell({
  children,
  onBackdrop,
  onHomeBar,
}: {
  children: React.ReactNode;
  onBackdrop: () => void;
  onHomeBar: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center bg-black/45 p-3 pb-[5.9rem] backdrop-blur-[3px] sm:items-center sm:pb-10"
      onClick={onBackdrop}
    >
      <div className="phone-device" onClick={(e) => e.stopPropagation()}>
        <div className="phone-screen flex h-[min(680px,calc(100dvh-7.25rem))] w-[min(378px,calc(100vw-1.5rem))] flex-col">
          <div className="phone-island" />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <button type="button" aria-label="Phone home" className="phone-home-bar" onClick={onHomeBar} />
        </div>
      </div>
    </div>
  );
}

export function PhoneApp({
  title,
  extra,
  onBack,
  children,
}: {
  title: string;
  extra?: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1 px-2 pb-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-full text-[#14F195] hover:bg-white/10"
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className="min-w-0 flex-1 truncate font-display text-[17px] font-semibold tracking-tight">{title}</h2>
        {extra}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-3 pb-2">{children}</div>
    </div>
  );
}

export function PhoneClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t || " "}</span>;
}

export function AppIcon({
  label,
  tint,
  onClick,
  badge,
  children,
}: {
  label: string;
  tint: string;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-1.5">
      <span className="relative">
        <span
          className={`grid h-[58px] w-[58px] place-items-center rounded-[16px] bg-gradient-to-br text-white shadow-[0_10px_22px_rgba(0,0,0,0.35)] transition group-active:scale-95 ${tint}`}
        >
          {children}
        </span>
        {!!badge && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff6b5a] px-1 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="max-w-[72px] truncate text-[10px] font-medium text-white/80">{label}</span>
    </button>
  );
}
