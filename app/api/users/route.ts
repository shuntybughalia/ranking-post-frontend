import { NextResponse } from "next/server";
import { requireSuperAdminSession } from "@/lib/admin-auth";
import { getUsers, toPublicUser } from "@/lib/users";

export async function GET() {
  const session = await requireSuperAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const users = await getUsers();
  return NextResponse.json({
    users: users.map(toPublicUser).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  });
}
