import type { UserRole } from "./types";

export function normalizeRole(role?: UserRole): UserRole {
  if (role === "super_admin" || role === "admin") return role;
  return "user";
}

export function canAccessAdmin(role?: UserRole): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "super_admin";
}

export function isSuperAdmin(role?: UserRole): boolean {
  return normalizeRole(role) === "super_admin";
}

export function canManageUsers(role?: UserRole): boolean {
  return isSuperAdmin(role);
}

export function getPostLoginRedirect(
  role: UserRole,
  requestedRedirect?: string | null,
): string {
  const safeRedirect =
    requestedRedirect &&
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : null;

  if (canAccessAdmin(role)) {
    if (safeRedirect?.startsWith("/admin")) return safeRedirect;
    return "/admin";
  }

  if (safeRedirect && !safeRedirect.startsWith("/admin")) {
    return safeRedirect;
  }

  return "/";
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    default:
      return "User";
  }
}
