import { NextResponse } from "next/server";
import { incrementArticleViews } from "@/lib/articles";
import { withApiErrors } from "@/lib/api-handler";

interface ViewRouteProps {
  params: Promise<{ id: string }>;
}

async function handlePOST(_request: Request, { params }: ViewRouteProps) {
  const { id } = await params;
  await incrementArticleViews(id);
  return NextResponse.json({ ok: true });
}

export const POST = withApiErrors(handlePOST);
