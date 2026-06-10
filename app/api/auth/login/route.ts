import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getPostLoginRedirect } from "@/lib/permissions";
import { verifyUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, redirect } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await verifyUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await createSession(user);

    return NextResponse.json({
      user,
      redirectTo: getPostLoginRedirect(user.role, redirect),
    });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
