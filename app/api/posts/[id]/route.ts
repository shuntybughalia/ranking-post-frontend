import { NextResponse } from "next/server";
import {
  deleteArticle,
  getArticleById,
  updateArticle,
} from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import {
  canDeletePost,
  canEditPost,
  requireSession,
} from "@/lib/post-auth";
import {
  parseTagsInput,
  validateImage,
  validatePostStatus,
} from "@/lib/post-validation";
import { canAccessAdmin } from "@/lib/permissions";
import { revalidatePostPaths } from "@/lib/revalidate-posts";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireSession();
  const { id } = await context.params;
  const article = await getArticleById(id);

  if (!article) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canEditPost(session, article)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ article });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!canEditPost(session, existing)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const isAdmin = canAccessAdmin(session.role);

    if (body.categoryId) {
      const categories = await getCategories();
      if (!categories.some((category) => category.id === body.categoryId)) {
        return NextResponse.json({ error: "Invalid category." }, { status: 400 });
      }
    }

    if (body.image !== undefined) {
      const imageError = validateImage(body.image ?? "");
      if (imageError) {
        return NextResponse.json({ error: imageError }, { status: 400 });
      }
    }

    let status = body.status
      ? validatePostStatus(body.status) ?? existing.status
      : existing.status;

    if (!isAdmin && status === "published" && existing.status !== "published") {
      status = "pending";
    }

    const article = await updateArticle(id, {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      categoryId: body.categoryId,
      image: body.image,
      tags: body.tags !== undefined ? parseTagsInput(body.tags) : undefined,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      status,
      publishedAt: body.publishedAt,
      featured: isAdmin ? body.featured : undefined,
    });

    if (!article) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    revalidatePostPaths(article);

    return NextResponse.json({ article });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!canDeletePost(session, existing)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const deleted = await deleteArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  revalidatePostPaths(existing);

  return NextResponse.json({ success: true });
}
