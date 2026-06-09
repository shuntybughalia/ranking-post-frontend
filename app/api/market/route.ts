import { NextResponse } from "next/server";
import { getMarketPackages } from "@/lib/market";

export async function GET() {
  const packages = await getMarketPackages();
  return NextResponse.json({ packages });
}
