import { NextResponse } from "next/server";
import { getArticlesByAuthor } from "@/lib/articles";
import { requireSuperAdminSession } from "@/lib/admin-auth";
import { getOrdersByUser } from "@/lib/orders";
import {
  deleteUser,
  getUserById,
  toPublicUser,
  updateUserRole,
} from "@/lib/users";
import type { UserRole } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const validRoles: UserRole[] = ["user", "admin", "super_admin"];

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireSuperAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const user = await getUserById(id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const [orders, articles] = await Promise.all([
    getOrdersByUser(id),
    getArticlesByAuthor(user.name),
  ]);

  return NextResponse.json({
    user: toPublicUser(user),
    orders,
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      date: a.date,
      featured: a.featured,
    })),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireSuperAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { role } = body;

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const user = await updateUserRole(id, role, session.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSuperAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteUser(id, session.id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
