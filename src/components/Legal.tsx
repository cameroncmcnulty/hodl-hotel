import { Logo } from "./Logo";
import Link from "next/link";

export function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Logo />
      <h1 className="mt-8 font-display text-3xl">{title}</h1>
      <article className="prose prose-invert mt-6 max-w-none space-y-3 text-sm leading-relaxed text-white/80 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-mint [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </article>
      <p className="mt-10 flex gap-4 text-xs text-white/50">
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/guidelines">Guidelines</Link>
        <Link href="/legal/virtual-goods">Virtual goods</Link>
        <Link href="/legal/cookies">Cookies</Link>
      </p>
    </main>
  );
}
