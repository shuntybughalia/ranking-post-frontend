import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { parseGender } from "@/lib/session";
import { createUser } from "@/lib/users";
import { withApiErrors } from "@/lib/api-handler";

async function handlePOST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const user = await createUser(name, email, password, parseGender(body.gender));
    await createSession(user);

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const POST = withApiErrors(handlePOST);
