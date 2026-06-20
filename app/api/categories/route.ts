import { NextResponse } from "next/server";
import { createCategory, deleteCategory, getCategories } from "@/lib/categories";
import { requireAdminSession } from "@/lib/admin-auth";
import { validateCategoryName } from "@/lib/post-validation";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const nameError = validateCategoryName(body.name ?? "");

    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const category = await createCategory(body.name, body.description);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create category.";
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
    return NextResponse.json({ error: "Category id is required." }, { status: 400 });
  }

  const deleted = await deleteCategory(id);

  if (!deleted) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
