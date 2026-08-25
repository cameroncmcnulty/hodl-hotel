import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const display = Fredoka({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const sans = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HODL Hotel",
  description: "A cartoon social hotel powered by Solana. Decorate rooms, hang with friends, trade furniture.",
  metadataBase: new URL("https://hodlhotel.app"),
  openGraph: {
    title: "HODL Hotel",
    description: "Cartoon rooms. Real friends. Powered by Solana.",
    images: ["/art/hotel-hero.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/art/landing-bg.jpg?v=6" media="(min-width: 768px)" />
        <link rel="preload" as="image" href="/art/landing-mobile.jpg?v=6" media="(max-width: 767px)" />
      </head>
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
