import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

const MAX_INLINE_IMAGE_CHARS = 2048;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Replace oversized / data-URI images so article documents stay small. */
export function compactArticleImage(image: string | undefined | null): string {
  const value = image?.trim() ?? "";
  if (!value) return DEFAULT_IMAGE;
  if (value.startsWith("data:") || value.length > MAX_INLINE_IMAGE_CHARS) {
    return DEFAULT_IMAGE;
  }
  return value;
}

/**
 * Persist a data-URI featured image to /public/uploads and return a public URL.
 * Falls back to the default image when running on serverless or on failure.
 */
export async function persistArticleImage(image: string): Promise<string> {
  const trimmed = image.trim();
  if (!trimmed) return DEFAULT_IMAGE;
  if (!trimmed.startsWith("data:")) {
    return compactArticleImage(trimmed);
  }

  if (isServerless()) {
    // Runtime uploads are not durable on serverless filesystems.
    return DEFAULT_IMAGE;
  }

  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return DEFAULT_IMAGE;

  const [, mime, base64] = match;
  const ext = EXT_BY_MIME[mime];
  if (!ext) return DEFAULT_IMAGE;

  try {
    const buffer = Buffer.from(base64, "base64");
    const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 16);
    const filename = `${hash}-${randomUUID().slice(0, 8)}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.warn(
      "Failed to persist featured image upload:",
      error instanceof Error ? error.message : error,
    );
    return DEFAULT_IMAGE;
  }
}

export { DEFAULT_IMAGE };
