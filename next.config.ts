import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 300,
  // Pin Turbopack root to this app so hashed externals (e.g. mongodb-*)
  // resolve under node_modules instead of a wrong parent path.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "gifyu.com",
      },
    ],
  },
};

export default nextConfig;
