import { NextResponse } from "next/server";
import { getPostStats } from "@/lib/articles";
import { requireSession } from "@/lib/post-auth";
import { canAccessAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const stats = await getPostStats(
    canAccessAdmin(session.role) ? undefined : session.id,
  );

  return NextResponse.json({ stats });
}
