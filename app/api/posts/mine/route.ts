import { NextResponse } from "next/server";
import { getArticlesByAuthorId } from "@/lib/articles";
import { requireSession } from "@/lib/post-auth";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const articles = await getArticlesByAuthorId(session.id);
  return NextResponse.json({ articles });
}
