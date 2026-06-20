import { NextResponse } from "next/server";
import {
  createArticle,
  getAllArticles,
  getArticles,
} from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { requireSession } from "@/lib/post-auth";
import {
  parseTagsInput,
  validateImage,
  validatePostStatus,
} from "@/lib/post-validation";
import { canAccessAdmin } from "@/lib/permissions";
import { revalidatePostPaths } from "@/lib/revalidate-posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "admin") {
    const session = await requireSession();
    if (!session || !canAccessAdmin(session.role)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const articles = await getAllArticles();
    return NextResponse.json({ articles });
  }

  const articles = await getArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      image,
      tags,
      metaTitle,
      metaDescription,
      status,
      publishedAt,
      featured,
    } = body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required." },
        { status: 400 },
      );
    }

    if (!categoryId?.trim()) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 },
      );
    }

    const categories = await getCategories();
    if (!categories.some((category) => category.id === categoryId)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const imageError = validateImage(image ?? "");
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }

    const parsedStatus = validatePostStatus(status) ?? "draft";
    const isAdmin = canAccessAdmin(session.role);

    let finalStatus = parsedStatus;
    if (!isAdmin && parsedStatus === "published") {
      finalStatus = "pending";
    }

    const article = await createArticle({
      title,
      slug,
      excerpt,
      content,
      categoryId,
      image: image?.trim() || "",
      tags: parseTagsInput(tags),
      metaTitle,
      metaDescription,
      author: session.name,
      authorId: session.id,
      status: finalStatus,
      publishedAt: publishedAt ?? null,
      featured: isAdmin ? Boolean(featured) : false,
    });

    revalidatePostPaths(article);

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
