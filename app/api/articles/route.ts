import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createArticle, getAllArticles } from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { validateImage } from "@/lib/post-validation";
import { revalidatePostPaths } from "@/lib/revalidate-posts";

export async function GET() {
  const articles = await getAllArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, category, categoryId, image, featured } =
      body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required." },
        { status: 400 },
      );
    }

    const categories = await getCategories();
    const resolvedCategoryId =
      categoryId ??
      categories.find((item) => item.name === category)?.id ??
      categories[0]?.id;

    if (!resolvedCategoryId) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const imageValue =
      image?.trim() ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";
    const imageError = validateImage(imageValue);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }

    const article = await createArticle({
      title,
      excerpt,
      content,
      categoryId: resolvedCategoryId,
      image: imageValue,
      author: session.name,
      authorId: session.id,
      status: "published",
      publishedAt: new Date().toISOString(),
      featured: Boolean(featured),
    });

    revalidatePostPaths(article);
    revalidatePath("/admin/articles");

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create article.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
