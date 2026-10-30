import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { withApiErrors } from "@/lib/api-handler";
import { deleteContactMessage } from "@/lib/contact";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleDELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const deleted = await deleteContactMessage(id);
  if (!deleted) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export const DELETE = withApiErrors(handleDELETE);
