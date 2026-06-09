import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { COOKIE_NAME, signSessionToken, verifySessionToken } from "./session";
import { ensureSuperAdmin, getUserById, toSessionUser } from "./users";

export async function createSession(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  await ensureSuperAdmin();

  const user = await getUserById(payload.id);
  if (!user) return null;

  return toSessionUser(user);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME, verifySessionToken };
