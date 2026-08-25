import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      {
        source: "/art/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false, os: false, path: false };
    return config;
  },
};

export default nextConfig;
