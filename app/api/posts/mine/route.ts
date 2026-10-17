import { NextResponse } from "next/server";
import { getArticlesByAuthorId } from "@/lib/articles";
import { requireSession } from "@/lib/post-auth";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const articles = await getArticlesByAuthorId(session.id);
  return NextResponse.json({ articles });
}

export const GET = withApiErrors(handleGET);
