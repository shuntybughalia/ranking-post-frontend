import type { FaqItem, PostStatus } from "./types";

const POST_STATUSES: PostStatus[] = ["draft", "pending", "published", "rejected"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function parseTagsInput(input: unknown): string[] {
  if (Array.isArray(input)) {
    return [...new Set(input.map(String).map((t) => t.trim()).filter(Boolean))];
  }

  if (typeof input === "string") {
    return [
      ...new Set(
        input
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ];
  }

  return [];
}

export function validatePostStatus(status: unknown): PostStatus | null {
  if (typeof status !== "string") return null;
  return POST_STATUSES.includes(status as PostStatus)
    ? (status as PostStatus)
    : null;
}

export function validateImage(image: string): string | null {
  const trimmed = image.trim();
  if (!trimmed) {
    return "Featured image is required.";
  }

  if (trimmed.startsWith("data:")) {
    const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return "Invalid image data.";

    const [, mime, base64] = match;
    if (!ALLOWED_IMAGE_TYPES.includes(mime)) {
      return "Image must be JPEG, PNG, WebP, or GIF.";
    }

    const size = Math.ceil((base64.length * 3) / 4);
    if (size > MAX_IMAGE_BYTES) {
      return "Image must be 5 MB or smaller.";
    }

    return null;
  }

  // Images uploaded through /api/images (or local dev uploads) are site-relative.
  if (/^\/(api\/images|uploads)\/[\w.-]+$/.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "Image URL must use http or https.";
    }
  } catch {
    return "Invalid image URL.";
  }

  return null;
}

const MAX_FAQS = 20;
const MAX_FAQ_QUESTION_CHARS = 300;
const MAX_FAQ_ANSWER_CHARS = 2000;

/**
 * Trims FAQ items and drops fully blank rows. Throws a user-facing Error for
 * half-filled or oversized items (the post routes turn it into a 400).
 */
export function parseFaqsInput(input: unknown): FaqItem[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error("Invalid FAQ data.");

  const faqs = input
    .map((item) => ({
      question: typeof item?.question === "string" ? item.question.trim() : "",
      answer: typeof item?.answer === "string" ? item.answer.trim() : "",
    }))
    .filter((item) => item.question || item.answer);

  if (faqs.length > MAX_FAQS) {
    throw new Error(`A post can have at most ${MAX_FAQS} FAQs.`);
  }
  if (faqs.some((item) => !item.question || !item.answer)) {
    throw new Error("Each FAQ needs both a question and an answer.");
  }
  if (faqs.some((item) => item.question.length > MAX_FAQ_QUESTION_CHARS)) {
    throw new Error(`FAQ questions must be ${MAX_FAQ_QUESTION_CHARS} characters or fewer.`);
  }
  if (faqs.some((item) => item.answer.length > MAX_FAQ_ANSWER_CHARS)) {
    throw new Error(`FAQ answers must be ${MAX_FAQ_ANSWER_CHARS} characters or fewer.`);
  }

  return faqs;
}

export function validateCategoryName(name: string): string | null {
  if (!name.trim()) return "Category name is required.";
  if (name.trim().length > 50) return "Category name is too long.";
  return null;
}

