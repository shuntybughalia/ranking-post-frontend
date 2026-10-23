/**
 * Hosts served through the Next.js image optimizer (also used for
 * `images.remotePatterns` in next.config.ts). Images from any other host are
 * rendered as-is, so an unexpected host never breaks a page.
 */
const OPTIMIZED_IMAGE_HOSTS = ["images.unsplash.com", "gifyu.com", "**.gifyu.com"];

/** Static hosts plus the S3 bucket (or its CDN) that uploads go to, set by next.config.ts. */
export function getOptimizedImageHosts(): string[] {
  const s3Host = process.env.NEXT_PUBLIC_S3_IMAGE_HOST;
  return s3Host ? [...OPTIMIZED_IMAGE_HOSTS, s3Host] : OPTIMIZED_IMAGE_HOSTS;
}

function hostMatches(hostname: string, pattern: string) {
  if (pattern.startsWith("**.")) {
    const base = pattern.slice(3);
    return hostname === base || hostname.endsWith(`.${base}`);
  }
  return hostname === pattern;
}

export function isOptimizableImage(src: string): boolean {
  if (src.startsWith("/")) return !src.startsWith("//");
  if (!src.startsWith("https://")) return false;

  try {
    const { hostname } = new URL(src);
    return getOptimizedImageHosts().some((pattern) => hostMatches(hostname, pattern));
  } catch {
    return false;
  }
}
