"use client";

import Link from "next/link";
import { KeyedImage } from "./KeyedImage";

export function LandingHero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-2 lg:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        <img src="/art/hotel-hero.jpg" alt="HODL Hotel — cartoon hotel" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
        <p className="absolute bottom-4 left-4 font-display text-2xl">The hotel is live.</p>
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-6 animate-pulse rounded-full bg-sol/40 blur-3xl" />
          <div className="absolute inset-10 rounded-full bg-mint/30 blur-2xl" />
          <KeyedImage src="/art/generator.jpg" alt="Solana power generator" className="relative z-10 mx-auto h-72 w-72 object-contain md:h-80 md:w-80" />
        </div>
        <p className="glow-sol mt-2 font-display text-3xl font-semibold md:text-4xl">Powered by Solana</p>
        <p className="mt-3 max-w-md text-sm text-white/70">
          Check in, dress a guest, claim a room, and spend starter coins on furniture. Chat, trade, roll dice, teleport,
          and rent a board in SHILL ZONE.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/join" className="btn-sol px-6 py-3 text-base">
            Create a guest
          </Link>
          <Link href="/login" className="btn-ink px-6 py-3 text-base">
            I have a key
          </Link>
        </div>
      </div>
    </section>
  );
}
