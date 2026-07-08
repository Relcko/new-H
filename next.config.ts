import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    qualities: [50, 75],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
