import { NextResponse } from "next/server";
import { createTag, deleteTag, getTags } from "@/lib/tags";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const tags = await getTags();
  return NextResponse.json({ tags });
}

export async function POST(request: Request) {
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

export async function DELETE(request: Request) {
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
