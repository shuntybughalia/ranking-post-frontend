import { NextResponse } from "next/server";
import { approveArticle, getArticleById } from "@/lib/articles";
import { requireAdminSession } from "@/lib/admin-auth";
import { revalidatePostPaths } from "@/lib/revalidate-posts";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const article = await approveArticle(id);

  if (!article) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  revalidatePostPaths(article);

  return NextResponse.json({ article });
}
