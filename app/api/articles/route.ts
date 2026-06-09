import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createArticle, getArticles } from "@/lib/articles";
import { articleCategories } from "@/lib/types";

export async function GET() {
  const articles = await getArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, category, image, featured } = body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required." },
        { status: 400 },
      );
    }

    if (!articleCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const article = await createArticle({
      title,
      excerpt,
      content,
      category,
      image:
        image?.trim() ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
      author: session.name,
      featured: Boolean(featured),
    });

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create article.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
