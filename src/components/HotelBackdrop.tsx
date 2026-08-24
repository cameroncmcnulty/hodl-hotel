export function HotelBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <img
        src="/art/landing-bg.jpg"
        alt="HODL Hotel grounds with Solana power plant wired into the building"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[28%_center] md:object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/25" />
      {children}
    </div>
  );
}
