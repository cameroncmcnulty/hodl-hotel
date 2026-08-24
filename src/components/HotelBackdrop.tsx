export function HotelBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#4eb8ff] text-ink">
      <img
        src="/art/landing-bg.jpg"
        alt="HODL Hotel grounds with Solana power plant. Pixel sign reads Powered by Solana."
        className="pointer-events-none relative z-0 mx-auto h-[36vh] w-full object-contain object-center md:fixed md:inset-0 md:h-full md:object-contain"
      />
      {children}
    </div>
  );
}
