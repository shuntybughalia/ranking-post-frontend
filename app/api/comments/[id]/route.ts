import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/comments";
import { requireSession } from "@/lib/post-auth";
import { withApiErrors } from "@/lib/api-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** The comment's author or an admin can delete it. */
async function handleDELETE(_request: Request, context: RouteContext) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteComment(id, session);

  if (result === "not_found") {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (result === "forbidden") {
    return NextResponse.json({ error: "You can only delete your own comments." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

export const DELETE = withApiErrors(handleDELETE);
