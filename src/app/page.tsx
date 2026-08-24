import { Logo } from "@/components/Logo";
import { LandingHero } from "@/components/LandingHero";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/legal/terms" className="text-white/70 hover:text-white">
            Terms
          </Link>
          <Link href="/login" className="btn-ink">
            Sign in
          </Link>
          <Link href="/join" className="btn-sol">
            Check in
          </Link>
        </nav>
      </header>

      <LandingHero />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {[
          { t: "Your pad", d: "Five layouts, 30-slot backpack, pixel furniture you actually own in-game." },
          { t: "The floor", d: "Lobby, Roof Pool, SHILL ZONE, The Cook Room, Signal Arcade — always open." },
          { t: "Solana rails", d: "Buy coins with SOL. Hang a wallet NFT in a frame. Rent a board. Stay 18+ for payments." },
        ].map((c) => (
          <div key={c.t} className="panel p-5">
            <h3 className="font-display text-xl text-mint">{c.t}</h3>
            <p className="mt-2 text-sm text-white/70">{c.d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/50">
        <p>HODL Hotel is an original social game. Not affiliated with Sulake or any other hotel sim.</p>
        <p className="mt-2 flex justify-center gap-4">
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/guidelines">Community</Link>
          <Link href="/legal/virtual-goods">Virtual goods</Link>
          <Link href="/legal/cookies">Cookies</Link>
        </p>
      </footer>
    </div>
  );
}
