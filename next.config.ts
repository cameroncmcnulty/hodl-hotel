import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false, os: false, path: false };
    return config;
  },
};

export default nextConfig;
