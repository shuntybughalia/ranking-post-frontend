import "server-only";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Binary } from "mongodb";
import { getDb, isMongoConfigured } from "./mongodb";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

const IMAGES_COLLECTION = "article_images";
const MAX_INLINE_IMAGE_CHARS = 2048;
const SAVE_FAILED = "We couldn't save the featured image. Please try again.";

export const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

interface StoredImage {
  _id: string;
  mime: string;
  data: Binary;
  size: number;
  createdAt: Date;
}

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
 * Stores an uploaded image and returns its public URL. MongoDB keeps it
 * durable on serverless hosts; without Mongo (local dev) it goes to /public/uploads.
 */
export async function saveImage(buffer: Buffer, mime: string): Promise<string> {
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new Error("Image must be JPEG, PNG, WebP, or GIF.");

  // Content hash as id: re-uploading the same image reuses the stored copy.
  const id = createHash("sha256").update(buffer).digest("hex").slice(0, 32);

  if (isMongoConfigured()) {
    const db = await getDb();
    await db.collection<StoredImage>(IMAGES_COLLECTION).updateOne(
      { _id: id },
      {
        $setOnInsert: {
          mime,
          data: new Binary(buffer),
          size: buffer.length,
          createdAt: new Date(),
        },
      },
      { upsert: true, maxTimeMS: 15_000 },
    );
    return `/api/images/${id}`;
  }

  if (isServerless()) {
    throw new Error("Image storage is not configured. Set MONGODB_URI.");
  }

  const filename = `${id}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function getStoredImage(
  id: string,
): Promise<{ mime: string; data: Buffer } | null> {
  if (!/^[a-f0-9]{32}$/.test(id) || !isMongoConfigured()) return null;

  const db = await getDb();
  const image = await db
    .collection<StoredImage>(IMAGES_COLLECTION)
    .findOne({ _id: id }, { maxTimeMS: 15_000 });

  return image ? { mime: image.mime, data: Buffer.from(image.data.buffer) } : null;
}

/** Turns a data-URI featured image into a stored image URL; URLs pass through. */
export async function persistArticleImage(image: string): Promise<string> {
  const trimmed = image.trim();
  if (!trimmed) return DEFAULT_IMAGE;
  if (!trimmed.startsWith("data:")) return compactArticleImage(trimmed);

  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !EXT_BY_MIME[match[1]]) {
    throw new Error("Image must be JPEG, PNG, WebP, or GIF.");
  }

  try {
    return await saveImage(Buffer.from(match[2], "base64"), match[1]);
  } catch (error) {
    console.error("Failed to persist featured image:", error);
    // Fail the save loudly instead of silently swapping in the placeholder.
    throw new Error(SAVE_FAILED);
  }
}

export { DEFAULT_IMAGE };
