import { NextResponse } from "next/server";
import { requireSession } from "@/lib/post-auth";
import { deleteSiteReview } from "@/lib/site-reviews";
import { withApiErrors } from "@/lib/api-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** The review's author or an admin can delete it. */
async function handleDELETE(_request: Request, context: RouteContext) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteSiteReview(id, session);

  if (result === "not_found") {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  if (result === "forbidden") {
    return NextResponse.json({ error: "You can only delete your own review." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

export const DELETE = withApiErrors(handleDELETE);
