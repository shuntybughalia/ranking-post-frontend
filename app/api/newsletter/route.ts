import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSubscribers, subscribeEmail } from "@/lib/newsletter";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const subscribers = await getSubscribers();
  return NextResponse.json({ subscribers });
}

async function handlePOST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const subscriber = await subscribeEmail(email);
    return NextResponse.json({ subscriber }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe." },
      { status: 500 },
    );
  }
}

export const GET = withApiErrors(handleGET);
export const POST = withApiErrors(handlePOST);
