import { NextResponse } from "next/server";
import { getArticlesForListing } from "@/lib/articles";

export const revalidate = 60;
export const maxDuration = 60;

export async function GET() {
  try {
    const articles = await getArticlesForListing();

    return NextResponse.json(
      { articles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load article listing:", error);
    return NextResponse.json(
      { error: "Failed to load articles.", articles: [] },
      { status: 500 },
    );
  }
}
