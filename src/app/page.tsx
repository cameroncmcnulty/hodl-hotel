import { HotelBackdrop } from "@/components/HotelBackdrop";
import { LandingDesk } from "@/components/LandingDesk";
import { Wordmark } from "@/components/Wordmark";
import Link from "next/link";

export default function Home() {
  return (
    <HotelBackdrop>
      <Wordmark />
      <LandingDesk />
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-black/55 px-3 py-2 text-[10px] text-white/85 md:text-[11px]">
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
