import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
