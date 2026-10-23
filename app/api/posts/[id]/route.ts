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
  parseFaqsInput,
  parseTagsInput,
  validateImage,
  validatePostStatus,
} from "@/lib/post-validation";
import { canAccessAdmin } from "@/lib/permissions";
import { revalidatePostPaths } from "@/lib/revalidate-posts";
import { withApiErrors } from "@/lib/api-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleGET(_request: Request, context: RouteContext) {
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

async function handlePATCH(request: Request, context: RouteContext) {
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

    const status = body.status
      ? validatePostStatus(body.status) ?? existing.status
      : existing.status;

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
      faqs: body.faqs !== undefined ? parseFaqsInput(body.faqs) : undefined,
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

async function handleDELETE(_request: Request, context: RouteContext) {
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

export const GET = withApiErrors(handleGET);
export const PATCH = withApiErrors(handlePATCH);
export const DELETE = withApiErrors(handleDELETE);
