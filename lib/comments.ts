import "server-only";
import { readJson, writeJson } from "./db";
import { canAccessAdmin } from "./permissions";
import type { PostComment, SessionUser } from "./types";

const COMMENTS_FILE = "comments.json";
export const MAX_COMMENT_LENGTH = 2000;
const COMMENT_COOLDOWN_MS = 20_000;

async function getAllComments(): Promise<PostComment[]> {
  return readJson<PostComment[]>(COMMENTS_FILE, []);
}

/** Oldest first, so the thread reads top to bottom. */
export async function getCommentsForArticle(articleId: string): Promise<PostComment[]> {
  const comments = await getAllComments();
  return comments
    .filter((comment) => comment.articleId === articleId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function validateCommentBody(body: unknown): string | null {
  if (typeof body !== "string" || !body.trim()) return "Comment can't be empty.";
  if (body.trim().length > MAX_COMMENT_LENGTH) {
    return `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`;
  }
  return null;
}

export async function addComment(
  articleId: string,
  user: SessionUser,
  body: string,
): Promise<PostComment> {
  const comments = await getAllComments();

  const lastByUser = comments
    .filter((comment) => comment.userId === user.id)
    .reduce((latest, comment) => Math.max(latest, new Date(comment.createdAt).getTime()), 0);
  if (Date.now() - lastByUser < COMMENT_COOLDOWN_MS) {
    throw new Error("You're commenting too fast. Please wait a few seconds.");
  }

  const comment: PostComment = {
    id: crypto.randomUUID(),
    articleId,
    userId: user.id,
    name: user.name,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);
  await writeJson(COMMENTS_FILE, comments);
  return comment;
}

export function canDeleteComment(user: SessionUser, comment: PostComment): boolean {
  return comment.userId === user.id || canAccessAdmin(user.role);
}

/** Returns "not_found" or "forbidden" when the comment can't be removed by this user. */
export async function deleteComment(
  id: string,
  user: SessionUser,
): Promise<"deleted" | "not_found" | "forbidden"> {
  const comments = await getAllComments();
  const comment = comments.find((item) => item.id === id);

  if (!comment) return "not_found";
  if (!canDeleteComment(user, comment)) return "forbidden";

  await writeJson(
    COMMENTS_FILE,
    comments.filter((item) => item.id !== id),
  );
  return "deleted";
}
