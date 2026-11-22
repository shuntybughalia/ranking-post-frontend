import { NextResponse } from "next/server";
import { approveArticle, getArticleById } from "@/lib/articles";
import { requireAdminSession } from "@/lib/admin-auth";
import { revalidatePostPaths } from "@/lib/revalidate-posts";
import { withApiErrors } from "@/lib/api-handler";
import { EXTRA_POST_PRICE } from "@/lib/post-pricing";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handlePOST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const confirmer = session.role === "super_admin" && body?.paymentConfirmed === true
    ? session.id
    : undefined;
  if (existing.manualPayment && !existing.manualPayment.confirmedAt && !confirmer) {
    return NextResponse.json(
      { error: `A super admin must confirm receipt of ${EXTRA_POST_PRICE} from Moderation.` },
      { status: 402 },
    );
  }
  const article = await approveArticle(id, confirmer);

  if (!article) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  revalidatePostPaths(article);

  return NextResponse.json({ article });
}

export const POST = withApiErrors(handlePOST);
