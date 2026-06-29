import { NextResponse } from "next/server";
import { incrementArticleViews } from "@/lib/articles";

interface ViewRouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: ViewRouteProps) {
  const { id } = await params;
  await incrementArticleViews(id);
  return NextResponse.json({ ok: true });
}
