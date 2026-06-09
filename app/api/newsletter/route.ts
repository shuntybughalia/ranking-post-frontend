import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSubscribers, subscribeEmail } from "@/lib/newsletter";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const subscribers = await getSubscribers();
  return NextResponse.json({ subscribers });
}

export async function POST(request: Request) {
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
