import { NextResponse } from "next/server";
import { getArticleById } from "@/lib/articles";
import { addComment, getCommentsForArticle, validateCommentBody } from "@/lib/comments";
import { requireSession } from "@/lib/post-auth";
import { withApiErrors } from "@/lib/api-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function findPublishedArticle(context: RouteContext) {
  const { id } = await context.params;
  const article = await getArticleById(id);
  return article?.status === "published" ? article : null;
}

/** Public: comments on a published post. */
async function handleGET(_request: Request, context: RouteContext) {
  const article = await findPublishedArticle(context);
  if (!article) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const comments = await getCommentsForArticle(article.id);
  return NextResponse.json({ comments });
}

/** Signed-in users only. */
async function handlePOST(request: Request, context: RouteContext) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to comment." }, { status: 401 });
  }

  const article = await findPublishedArticle(context);
  if (!article) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { body } = (await request.json()) as { body?: unknown };
  const bodyError = validateCommentBody(body);
  if (bodyError) {
    return NextResponse.json({ error: bodyError }, { status: 400 });
  }

  try {
    const comment = await addComment(article.id, session, body as string);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("You're commenting too fast")) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}

export const GET = withApiErrors(handleGET);
export const POST = withApiErrors(handlePOST);
