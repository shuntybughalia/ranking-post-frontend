import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/stats";

export async function GET() {
  const stats = await getPlatformStats();
  return NextResponse.json({ stats });
}
