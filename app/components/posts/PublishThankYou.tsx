"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import StarPicker from "@/app/components/ui/StarPicker";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { showToast } from "@/lib/toast";

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

interface PublishThankYouProps {
  title: string;
  slug: string;
  /** Leaves the dialog and continues to the next page. */
  onClose: () => void;
}

/** Shown right after a post goes live: thanks the author and asks for a review of the site. */
export default function PublishThankYou({ title, slug, onClose }: PublishThankYouProps) {
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ hasReviewed: boolean }>("/api/reviews", { toastOnError: false })
      .then((data) => setHasReviewed(data.hasReviewed))
      .catch(() => setHasReviewed(false));
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        json: { rating, body },
        toastOnError: false,
      });
      showToast("Thanks for your review!", "success");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-navy/50 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-thanks-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl sm:p-8"
      >
        <div className="text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h2 id="publish-thanks-title" className="mt-4 text-2xl font-bold text-navy">
            Thank you for publishing!
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your post is now live on RANKINGPOST.
          </p>
          <Link
            href={`/blog/${slug}`}
            className="mt-1 inline-block break-words text-sm font-semibold text-gold-dark hover:underline"
          >
            View &ldquo;{title}&rdquo;
          </Link>
        </div>

        {hasReviewed ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">Thanks for the review you left earlier.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 border-t border-border pt-5">
            <p className="text-center font-semibold text-navy">How was your experience?</p>
            <p className="mt-1 text-center text-xs text-muted">
              Your review, name and photo will be shown publicly on our homepage.
            </p>

            <div className="mt-4 flex justify-center">
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <label htmlFor="publish-review" className="sr-only">
              Your review
            </label>
            <textarea
              id="publish-review"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minLength={MIN_LENGTH}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder="Tell others what publishing on RANKINGPOST was like..."
              className="mt-4 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted hover:bg-slate-50"
              >
                Maybe later
              </button>
              <button
                type="submit"
                disabled={submitting || body.trim().length < MIN_LENGTH}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Post review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
