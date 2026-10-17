import { NextResponse } from "next/server";
import { getMarketPackages } from "@/lib/market";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const packages = await getMarketPackages();
  return NextResponse.json({ packages });
}

export const GET = withApiErrors(handleGET);
