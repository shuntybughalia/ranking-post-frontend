export const MAX_BIO_CHARS = 300;

const SITE_IMAGE_PATH = /^\/(api\/images|uploads)\/[\w.-]+$/;

/** Profile photo must be an uploaded site image or an http(s) URL (no data: URIs). */
export function validateAvatarUrl(value: string): string | null {
  if (!value || SITE_IMAGE_PATH.test(value)) return null;
  if (value.length > 2048) return "Profile photo URL is too long.";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? null : "Profile photo must be an http(s) URL.";
  } catch {
    return "Invalid profile photo URL.";
  }
}

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g;

/** Splits bio text into plain text and links; trailing punctuation stays outside the link. */
export function splitBioLinks(bio: string): Array<{ text: string; href?: string }> {
  const parts: Array<{ text: string; href?: string }> = [];
  for (const piece of bio.split(URL_PATTERN)) {
    if (!piece) continue;
    if (!/^https?:\/\//.test(piece)) {
      parts.push({ text: piece });
      continue;
    }
    const href = piece.replace(/[.,!?;:)\]]+$/, "");
    parts.push({ text: href, href });
    if (href.length < piece.length) parts.push({ text: piece.slice(href.length) });
  }
  return parts;
}
