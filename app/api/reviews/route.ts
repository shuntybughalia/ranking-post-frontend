import { NextResponse } from "next/server";
import { requireSession } from "@/lib/post-auth";
import {
  canReviewSite,
  getSiteReviews,
  upsertSiteReview,
  validateReviewInput,
} from "@/lib/site-reviews";
import { withApiErrors } from "@/lib/api-handler";

/** Public list, plus whether the signed-in user may leave a review. */
async function handleGET() {
  const [reviews, session] = await Promise.all([getSiteReviews(), requireSession()]);
  const canReview = session ? await canReviewSite(session) : false;
  return NextResponse.json({ reviews, canReview });
}

async function handlePOST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  }

  if (!(await canReviewSite(session))) {
    return NextResponse.json(
      { error: "Publish a guest post first, then come back to review your experience." },
      { status: 403 },
    );
  }

  const { rating, body } = (await request.json()) as { rating?: unknown; body?: unknown };
  const inputError = validateReviewInput(rating, body);
  if (inputError) {
    return NextResponse.json({ error: inputError }, { status: 400 });
  }

  const review = await upsertSiteReview(session, rating as number, body as string);
  return NextResponse.json({ review }, { status: 201 });
}

export const GET = withApiErrors(handleGET);
export const POST = withApiErrors(handlePOST);
