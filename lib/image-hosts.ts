/**
 * Hosts served through the Next.js image optimizer (also used for
 * `images.remotePatterns` in next.config.ts). Images from any other host are
 * rendered as-is, so an unexpected host never breaks a page.
 */
export const OPTIMIZED_IMAGE_HOSTS = ["images.unsplash.com", "gifyu.com", "**.gifyu.com"];

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
    return OPTIMIZED_IMAGE_HOSTS.some((pattern) => hostMatches(hostname, pattern));
  } catch {
    return false;
  }
}
