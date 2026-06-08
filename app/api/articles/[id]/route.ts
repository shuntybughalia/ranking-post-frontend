import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteArticle } from "@/lib/articles";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");

  return NextResponse.json({ success: true });
}
