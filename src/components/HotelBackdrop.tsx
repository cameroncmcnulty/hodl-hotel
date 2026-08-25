export function HotelBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#4ec6f0]">
      <img
        src="/art/landing-mobile.jpg?v=5"
        alt=""
        width={1080}
        height={1920}
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full object-cover object-[center_62%] md:hidden"
        style={{ imageRendering: "pixelated" }}
      />
      <img
        src="/art/landing-bg.jpg?v=5"
        alt="HODL Hotel grounds with Solana power plant. Pixel sign reads Powered by Solana."
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none fixed inset-0 z-0 hidden h-[100dvh] w-full object-contain object-center md:block"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="relative z-10 min-h-[100dvh]">{children}</div>
    </div>
  );
}
