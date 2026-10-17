import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export const GET = withApiErrors(handleGET);
