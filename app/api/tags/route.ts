import { NextResponse } from "next/server";
import { createTag, deleteTag, getTags } from "@/lib/tags";
import { requireAdminSession } from "@/lib/admin-auth";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const tags = await getTags();
  return NextResponse.json({ tags });
}

async function handlePOST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Tag name is required." }, { status: 400 });
    }

    const tag = await createTag(body.name);
    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create tag.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function handleDELETE(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Tag id is required." }, { status: 400 });
  }

  const deleted = await deleteTag(id);

  if (!deleted) {
    return NextResponse.json({ error: "Tag not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export const GET = withApiErrors(handleGET);
export const POST = withApiErrors(handlePOST);
export const DELETE = withApiErrors(handleDELETE);
