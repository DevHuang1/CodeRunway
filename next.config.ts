import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel injects its own adapter, which conflicts with Next 16.3 standalone
  // output (vercel/next.js#96646). Standalone is only needed for Docker.
  output: process.env.VERCEL ? undefined : "standalone",
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  poweredByHeader: false,
};

export default nextConfig;
