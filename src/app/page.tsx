import { HotelBackdrop } from "@/components/HotelBackdrop";
import { LandingDesk } from "@/components/LandingDesk";
import { Wordmark } from "@/components/Wordmark";
import Link from "next/link";

export default function Home() {
  return (
    <HotelBackdrop>
      <Wordmark />
      <LandingDesk />
      <footer className="relative z-20 mt-auto flex flex-wrap items-center justify-between gap-2 bg-black/55 px-4 py-2 text-[11px] text-white/80 md:absolute md:bottom-0 md:left-0 md:right-0">
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
