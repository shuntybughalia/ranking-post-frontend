import "server-only";
import { getArticleSummariesByAuthorId } from "./articles";
import { readJson, writeJson } from "./db";
import { canAccessAdmin } from "./permissions";
import type { SessionUser, SiteReview } from "./types";

const REVIEWS_FILE = "site-reviews.json";
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 1000;

/** Newest first. */
export async function getSiteReviews(): Promise<SiteReview[]> {
  const reviews = await readJson<SiteReview[]>(REVIEWS_FILE, []);
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Only people who have actually published a guest post can review the service. */
export async function canReviewSite(user: SessionUser): Promise<boolean> {
  const posts = await getArticleSummariesByAuthorId(user.id);
  return posts.some((post) => post.status === "published");
}

export function validateReviewInput(rating: unknown, body: unknown): string | null {
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Please choose a rating from 1 to 5 stars.";
  }
  if (typeof body !== "string" || body.trim().length < MIN_REVIEW_LENGTH) {
    return `Review must be at least ${MIN_REVIEW_LENGTH} characters.`;
  }
  if (body.trim().length > MAX_REVIEW_LENGTH) {
    return `Review must be ${MAX_REVIEW_LENGTH} characters or fewer.`;
  }
  return null;
}

/** Creates the user's review, or updates it if they already left one. */
export async function upsertSiteReview(
  user: SessionUser,
  rating: number,
  body: string,
): Promise<SiteReview> {
  const reviews = await readJson<SiteReview[]>(REVIEWS_FILE, []);
  const now = new Date().toISOString();
  const existing = reviews.find((review) => review.userId === user.id);

  const review: SiteReview = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: user.id,
    name: user.name,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    rating,
    body: body.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await writeJson(REVIEWS_FILE, [
    ...reviews.filter((item) => item.userId !== user.id),
    review,
  ]);
  return review;
}

export async function deleteSiteReview(
  id: string,
  user: SessionUser,
): Promise<"deleted" | "not_found" | "forbidden"> {
  const reviews = await readJson<SiteReview[]>(REVIEWS_FILE, []);
  const review = reviews.find((item) => item.id === id);

  if (!review) return "not_found";
  if (review.userId !== user.id && !canAccessAdmin(user.role)) return "forbidden";

  await writeJson(
    REVIEWS_FILE,
    reviews.filter((item) => item.id !== id),
  );
  return "deleted";
}
