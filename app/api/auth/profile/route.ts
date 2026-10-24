import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/auth";
import { MAX_BIO_CHARS, validateAvatarUrl } from "@/lib/profile";
import { parseGender } from "@/lib/session";
import { updateUserProfile } from "@/lib/users";
import { withApiErrors } from "@/lib/api-handler";

async function handlePATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 },
      );
    }

    if (newPassword && !currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to set a new password." },
        { status: 400 },
      );
    }

    if (newPassword && currentPassword) {
      const { verifyUser } = await import("@/lib/users");
      const verified = await verifyUser(session.email, currentPassword);
      if (!verified) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 },
        );
      }
    }

    const bio = typeof body.bio === "string" ? body.bio.trim() : undefined;
    if (bio && bio.length > MAX_BIO_CHARS) {
      return NextResponse.json(
        { error: `Bio must be ${MAX_BIO_CHARS} characters or fewer.` },
        { status: 400 },
      );
    }

    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : undefined;
    const avatarError = avatarUrl !== undefined ? validateAvatarUrl(avatarUrl) : null;
    if (avatarError) {
      return NextResponse.json({ error: avatarError }, { status: 400 });
    }

    const updated = await updateUserProfile(session.id, {
      name: name?.trim() || undefined,
      password: newPassword || undefined,
      gender: parseGender(body.gender),
      bio,
      avatarUrl,
    });

    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await createSession(updated);

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}

export const PATCH = withApiErrors(handlePATCH);
