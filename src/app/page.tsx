import { HotelBackdrop } from "@/components/HotelBackdrop";
import { LandingDesk } from "@/components/LandingDesk";
import { Wordmark } from "@/components/Wordmark";
import Link from "next/link";

export default function Home() {
  return (
    <HotelBackdrop>
      <Wordmark />
      <LandingDesk />
      <p className="glow-sol pointer-events-none absolute bottom-[18%] right-[6%] z-10 hidden text-right font-display text-2xl font-semibold md:block md:text-4xl">
        Powered by Solana
      </p>
      <p className="glow-sol absolute bottom-14 left-1/2 z-10 -translate-x-1/2 font-display text-lg md:hidden">
        Powered by Solana
      </p>
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-black/55 px-4 py-2 text-[11px] text-white/80">
        <span>HODL Hotel is original. Not affiliated with any other hotel sim.</span>
        <nav className="flex flex-wrap gap-3">
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/guidelines">Community</Link>
          <Link href="/legal/virtual-goods">Virtual goods</Link>
          <Link href="/legal/cookies">Cookies</Link>
        </nav>
      </footer>
    </HotelBackdrop>
  );
}
