import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
  },
  compiler: {
    // Remove console.log statements in production builds
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"], // Keep console.error and console.warn
    } : false,
  },
};

export default nextConfig;
