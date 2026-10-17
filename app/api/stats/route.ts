import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/stats";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const stats = await getPlatformStats();
  return NextResponse.json({ stats });
}

export const GET = withApiErrors(handleGET);
