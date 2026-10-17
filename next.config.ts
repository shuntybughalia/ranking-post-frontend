import path from "path";
import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./lib/image-hosts";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 300,
  // Pin Turbopack root to this app so hashed externals (e.g. mongodb-*)
  // resolve under node_modules instead of a wrong parent path.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
