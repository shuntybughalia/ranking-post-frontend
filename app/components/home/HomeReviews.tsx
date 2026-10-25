"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { RatingSummary, ReviewCard, ReviewRow } from "@/app/components/ui/ReviewsSection";
import UserAvatar from "@/app/components/ui/UserAvatar";
import type { ClientReview } from "@/app/data/reviews";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { canAccessAdmin } from "@/lib/permissions";
import { SESSION_CHANGED_EVENT } from "@/lib/session-events";
import { showToast } from "@/lib/toast";
import type { SessionUser, SiteReview } from "@/lib/types";

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

interface HomeReviewsProps {
  /** Real reviews collected elsewhere, from app/data/reviews.ts. */
  curatedReviews: ClientReview[];
}

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className="text-gold transition-transform hover:scale-110"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= shown ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/** Homepage reviews from guest authors who have published on the site. */
export default function HomeReviews({ curatedReviews }: HomeReviewsProps) {
  const [reviews, setReviews] = useState<SiteReview[] | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    apiFetch<{ reviews: SiteReview[]; canReview: boolean }>("/api/reviews", { toastOnError: false })
      .then((data) => {
        setReviews(data.reviews);
        setCanReview(data.canReview);
      })
      .catch(() => setReviews([]));
    apiFetch<{ user: SessionUser | null }>("/api/auth/me", { toastOnError: false })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(SESSION_CHANGED_EVENT, load);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, load);
  }, [load]);

  const myReview = user ? reviews?.find((review) => review.userId === user.id) : undefined;

  function openForm() {
    setRating(myReview?.rating ?? 0);
    setBody(myReview?.body ?? "");
    setError("");
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const { review } = await apiFetch<{ review: SiteReview }>("/api/reviews", {
        method: "POST",
        json: { rating, body },
        toastOnError: false,
      });
      setReviews((current) => [review, ...(current ?? []).filter((item) => item.id !== review.id)]);
      setFormOpen(false);
      showToast(myReview ? "Review updated." : "Thanks for your review!", "success");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await apiFetch(`/api/reviews/${id}`, { method: "DELETE" });
      setReviews((current) => (current ?? []).filter((review) => review.id !== id));
    } catch {
      // apiFetch already showed the error toast.
    }
  }

  const isAdmin = canAccessAdmin(user?.role);
  const ratings = [
    ...curatedReviews.map((review) => review.rating),
    ...(reviews ?? []).map((review) => review.rating),
  ];
  const total = ratings.length;

  return (
    <section aria-labelledby="home-reviews-heading" className="py-12">
      <div className="mb-8 text-center">
        <h2 id="home-reviews-heading" className="text-2xl font-bold text-navy md:text-3xl">
          Reviews from Our Guest Authors
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-muted">
          Honest feedback from writers who have published guest posts on RANKINGPOST.
        </p>
        {total > 0 && (
          <div className="mt-4">
            <RatingSummary ratings={ratings} />
          </div>
        )}
      </div>

      {reviews === null ? (
        <p className="text-center text-sm text-muted">Loading reviews...</p>
      ) : total === 0 ? (
        <p className="text-center text-sm text-muted">
          No reviews yet. Published a guest post with us? Be the first to share your experience.
        </p>
      ) : (
        <ReviewRow>
          {curatedReviews.map((review, index) => (
            <ReviewCard
              key={`curated-${index}`}
              name={review.name}
              details={[review.role, review.location].filter(Boolean).join(" · ")}
              rating={review.rating}
              quote={review.quote}
            />
          ))}
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              details="Guest author"
              rating={review.rating}
              quote={review.body}
              avatar={<UserAvatar gender={review.gender} src={review.avatarUrl} className="h-10 w-10" />}
              action={
                user && (review.userId === user.id || isAdmin) ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete(review.id)}
                    className="text-xs font-medium text-muted transition-colors hover:text-red-600"
                  >
                    Delete
                  </button>
                ) : undefined
              }
            />
          ))}
        </ReviewRow>
      )}

      <div className="mt-6 flex justify-center">
        {!user ? (
          <p className="text-sm text-muted">
            Published a guest post?{" "}
            <Link href="/login?redirect=/" className="font-semibold text-gold-dark hover:underline">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        ) : !canReview ? (
          <p className="text-sm text-muted">
            Reviews are open to authors with a published post.{" "}
            <Link href="/submit" className="font-semibold text-gold-dark hover:underline">
              Submit a guest post
            </Link>
          </p>
        ) : !formOpen ? (
          <button
            type="button"
            onClick={openForm}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            {myReview ? "Edit your review" : "Leave a review"}
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <UserAvatar gender={user.gender} src={user.avatarUrl} className="h-10 w-10" />
              <div>
                <p className="font-semibold text-navy">{user.name}</p>
                <p className="text-xs text-muted">Your review will be shown publicly.</p>
              </div>
            </div>

            <div className="mt-5">
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <label htmlFor="review-body" className="sr-only">
              Your review
            </label>
            <textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minLength={MIN_LENGTH}
              maxLength={MAX_LENGTH}
              rows={4}
              placeholder="How was your experience publishing a guest post on RANKINGPOST?"
              className="mt-4 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || body.trim().length < MIN_LENGTH}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Saving..." : myReview ? "Update review" : "Post review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
