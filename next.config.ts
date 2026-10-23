import path from "path";
import type { NextConfig } from "next";
import { getOptimizedImageHosts } from "./lib/image-hosts";

/** Public host of uploaded images, derived from the same S3_* vars lib/s3.ts uses. */
function getS3ImageHost(): string | undefined {
  const { S3_PUBLIC_URL, S3_BUCKET, S3_REGION } = process.env;
  try {
    if (S3_PUBLIC_URL?.trim()) return new URL(S3_PUBLIC_URL.trim()).hostname;
  } catch {
    return undefined;
  }
  if (S3_BUCKET?.trim() && S3_REGION?.trim()) {
    return `${S3_BUCKET.trim()}.s3.${S3_REGION.trim()}.amazonaws.com`;
  }
  return undefined;
}

// Inlined into client code too, so PostImage optimises the same hosts as remotePatterns.
process.env.NEXT_PUBLIC_S3_IMAGE_HOST ??= getS3ImageHost() ?? "";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 300,
  // Pin Turbopack root to this app so hashed externals (e.g. mongodb-*)
  // resolve under node_modules instead of a wrong parent path.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: getOptimizedImageHosts().map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
