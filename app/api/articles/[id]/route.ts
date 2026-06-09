import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/articles";
import { articleCategories } from "@/lib/types";

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
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);

  if (!existing) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, category, image, featured } = body;

    if (category && !articleCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const article = await updateArticle(id, {
      title,
      excerpt,
      content,
      category,
      image,
      featured: featured !== undefined ? Boolean(featured) : undefined,
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/articles");

    return NextResponse.json({ article });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update article.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getArticleById(id);
  const deleted = await deleteArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/blog");
  if (existing) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/articles");

  return NextResponse.json({ success: true });
}
