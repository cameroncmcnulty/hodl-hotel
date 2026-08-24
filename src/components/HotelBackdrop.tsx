export function HotelBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#4eb8ff]">
      <img
        src="/art/landing-mobile.jpg"
        alt=""
        className="pointer-events-none fixed inset-0 h-[100dvh] w-full object-cover object-[center_70%] md:hidden"
      />
      <img
        src="/art/landing-bg.jpg"
        alt="HODL Hotel grounds with Solana power plant. Pixel sign reads Powered by Solana."
        className="pointer-events-none fixed inset-0 hidden h-[100dvh] w-full object-cover object-[center_80%] md:block"
      />
      <div className="relative z-10 min-h-[100dvh]">{children}</div>
    </div>
  );
}
