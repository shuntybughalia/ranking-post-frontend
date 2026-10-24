import { SignJWT, jwtVerify } from "jose";
import { normalizeRole } from "./permissions";
import { GENDERS, type Gender, type SessionUser, type UserRole } from "./types";

/** Returns a valid gender, or undefined for anything else (missing, old tokens, bad input). */
export function parseGender(value: unknown): Gender | undefined {
  return GENDERS.includes(value as Gender) ? (value as Gender) : undefined;
}

export const COOKIE_NAME = "rankingpost_session";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "rankingpost-dev-secret-change-in-production",
);

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
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
      role: normalizeRole(payload.role as UserRole | undefined),
      gender: parseGender(payload.gender),
      avatarUrl: typeof payload.avatarUrl === "string" ? payload.avatarUrl : undefined,
    };
  } catch {
    return null;
  }
}
