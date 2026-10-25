import type { ReactNode } from "react";
import type { ClientReview } from "@/app/data/reviews";

interface ReviewsSectionProps {
  title: string;
  subtitle?: string;
  reviews: ClientReview[];
}

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5 text-gold" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      ))}
    </div>
  );
}

/** Average rating pill, e.g. ★★★★★ 4.8 from 12 reviews. */
export function RatingSummary({ ratings }: { ratings: number[] }) {
  if (ratings.length === 0) return null;
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-sm text-navy">
      <Stars rating={Math.round(average)} />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-muted">
        from {ratings.length} {ratings.length === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

interface ReviewCardProps {
  name: string;
  details?: string;
  rating: number;
  quote: string;
  /** Replaces the initial badge, e.g. the reviewer's profile avatar. */
  avatar?: ReactNode;
  /** Extra control in the footer, e.g. a delete button. */
  action?: ReactNode;
}

export function ReviewCard({ name, details, rating, quote, avatar, action }: ReviewCardProps) {
  return (
    <figure className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-border bg-white p-6 shadow-sm sm:w-[46%] lg:w-[31.5%]">
      <Stars rating={rating} />
      <blockquote className="mt-4 flex-1 whitespace-pre-line break-words text-sm leading-relaxed text-[#30384e]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {avatar ?? (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-navy">{name}</span>
          {details && <span className="block truncate text-xs text-muted">{details}</span>}
        </span>
        {action}
      </figcaption>
    </figure>
  );
}

export function ReviewRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-3 flex snap-x snap-mandatory gap-5 overflow-x-auto px-3 pb-4">
      {children}
    </div>
  );
}

/** Client review cards in a swipeable row. Renders nothing until reviews are added. */
export default function ReviewsSection({ title, subtitle, reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="reviews-heading" className="py-12">
      <div className="mb-8 text-center">
        <h2 id="reviews-heading" className="text-2xl font-bold text-navy md:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mx-auto mt-2 max-w-2xl text-muted">{subtitle}</p>}
        <div className="mt-4">
          <RatingSummary ratings={reviews.map((review) => review.rating)} />
        </div>
      </div>

      <ReviewRow>
        {reviews.map((review, index) => (
          <ReviewCard
            key={`${review.name}-${index}`}
            name={review.name}
            details={[review.role, review.location].filter(Boolean).join(" · ")}
            rating={review.rating}
            quote={review.quote}
          />
        ))}
      </ReviewRow>
    </section>
  );
}
