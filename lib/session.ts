import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "./types";

export const COOKIE_NAME = "rankingpost_session";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "rankingpost-dev-secret-change-in-production",
);

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
