import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { withApiErrors } from "@/lib/api-handler";

async function handlePOST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

export const POST = withApiErrors(handlePOST);
