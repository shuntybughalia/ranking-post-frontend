import { NextResponse } from "next/server";
import { getArticleById, rejectArticle } from "@/lib/articles";
import { requireAdminSession } from "@/lib/admin-auth";
import { revalidatePostPaths } from "@/lib/revalidate-posts";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const reason =
    typeof body.reason === "string" ? body.reason : "Rejected by admin.";

  const article = await rejectArticle(id, reason);

  if (!article) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  revalidatePostPaths(article);

  return NextResponse.json({ article });
}
