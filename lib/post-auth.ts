import "server-only";
import { getSession } from "./auth";
import { canAccessAdmin } from "./permissions";
import type { Article, SessionUser } from "./types";

export async function requireSession(): Promise<SessionUser | null> {
  return getSession();
}

export function canEditPost(user: SessionUser, post: Article): boolean {
  if (canAccessAdmin(user.role)) return true;
  return post.authorId === user.id;
}

export function canDeletePost(user: SessionUser, post: Article): boolean {
  return canEditPost(user, post);
}

export function canModeratePost(user: SessionUser): boolean {
  return canAccessAdmin(user.role);
}
