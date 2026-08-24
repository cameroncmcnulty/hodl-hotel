export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sol to-mint font-display text-lg font-bold text-ink shadow-glow">
        H
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        HODL <span className="text-mint">Hotel</span>
      </span>
    </a>
  );
}
