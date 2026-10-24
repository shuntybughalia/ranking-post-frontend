import { NextResponse } from "next/server";
import { getArticlesByAuthorId } from "@/lib/articles";
import { requireSession } from "@/lib/post-auth";
import { withApiErrors } from "@/lib/api-handler";
import type { PostNotification } from "@/lib/types";

const MAX_NOTIFICATIONS = 10;

/** Review outcomes for the signed-in user's posts, newest first. */
async function handleGET() {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const articles = await getArticlesByAuthorId(session.id);
  const notifications: PostNotification[] = articles
    .filter((article) => article.status !== "draft")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_NOTIFICATIONS)
    .map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      rejectionReason: article.rejectionReason,
      at: article.updatedAt,
    }));

  return NextResponse.json({ notifications });
}

export const GET = withApiErrors(handleGET);
