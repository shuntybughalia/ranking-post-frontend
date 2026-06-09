import "server-only";
import { getSession } from "./auth";
import { canAccessAdmin, isSuperAdmin } from "./permissions";
import type { SessionUser } from "./types";

export async function requireAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.role)) return null;
  return session;
}

export async function requireSuperAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || !isSuperAdmin(session.role)) return null;
  return session;
}
