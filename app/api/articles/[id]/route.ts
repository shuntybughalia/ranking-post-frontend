import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { validateImage } from "@/lib/post-validation";
import { revalidatePostPaths } from "@/lib/revalidate-posts";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const article = await getArticleById(id);

  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, category, categoryId, image, featured } =
      body;

    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      const categories = await getCategories();
      resolvedCategoryId = categories.find((item) => item.name === category)?.id;
    }

    if (resolvedCategoryId) {
      const categories = await getCategories();
      if (!categories.some((item) => item.id === resolvedCategoryId)) {
        return NextResponse.json({ error: "Invalid category." }, { status: 400 });
      }
    }

    if (image !== undefined) {
      const imageError = validateImage(image ?? "");
      if (imageError) {
        return NextResponse.json({ error: imageError }, { status: 400 });
      }
    }

    const article = await updateArticle(id, {
      title,
      excerpt,
      content,
      categoryId: resolvedCategoryId,
      image,
      featured: featured !== undefined ? Boolean(featured) : undefined,
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    revalidatePostPaths(article);

    return NextResponse.json({ article });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update article.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);
  const deleted = await deleteArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  revalidatePostPaths(existing);

  return NextResponse.json({ success: true });
}
