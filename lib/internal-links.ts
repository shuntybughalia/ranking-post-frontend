import { getSiteUrl } from "./site-url";

export const INTERNAL_LINK_REQUIRED =
  "Add at least one internal link to another RankingPost page (for example /blog/your-post) before publishing.";

const HREF_PATTERN = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi;

function bareHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isInternalHref(href: string, siteHost: string): boolean {
  const value = href.trim();
  if (value.startsWith("/")) return !value.startsWith("//");

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && bareHost(url.hostname) === siteHost;
  } catch {
    return false;
  }
}

/** True when the post HTML links to at least one page on this site (relative or same-domain URL). */
export function hasInternalLink(html: string): boolean {
  const siteHost = bareHost(new URL(getSiteUrl()).hostname);
  for (const match of html.matchAll(HREF_PATTERN)) {
    if (isInternalHref(match[2], siteHost)) return true;
  }
  return false;
}
