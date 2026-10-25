export interface ClientReview {
  /** Client's name as they agreed to have it shown. */
  name: string;
  /** Job title and company, e.g. "Marketing Lead, Acme Co." */
  role?: string;
  /** e.g. "Austin, TX" */
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
}

/**
 * Real client reviews only — published testimonials must come from actual
 * customers (FTC rules on consumer reviews). Each section stays hidden while
 * its list is empty. Format:
 *
 *   {
 *     name: "Jane Doe",
 *     role: "Founder, Example Co.",
 *     location: "Denver, CO",
 *     rating: 5,
 *     quote: "What the client said, in their words.",
 *   },
 */

/** Homepage: why clients chose RANKINGPOST for guest posting. */
export const guestPostingReviews: ClientReview[] = [];

/** Services page: feedback on SEO packages. */
export const seoServiceReviews: ClientReview[] = [];
