"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { canAccessAdmin } from "@/lib/permissions";
import { SESSION_CHANGED_EVENT } from "@/lib/session-events";
import { showToast } from "@/lib/toast";
import type { PostComment, SessionUser } from "@/lib/types";

const MAX_LENGTH = 2000;

interface CommentsSectionProps {
  articleId: string;
  slug: string;
}

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Comment thread under a post. Loads on the client so cached post pages stay static. */
export default function CommentsSection({ articleId, slug }: CommentsSectionProps) {
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSession = useCallback(() => {
    apiFetch<{ user: SessionUser | null }>("/api/auth/me", { toastOnError: false })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    apiFetch<{ comments: PostComment[] }>(`/api/posts/${articleId}/comments`, {
      toastOnError: false,
    })
      .then((data) => setComments(data.comments))
      .catch(() => setComments([]));

    loadSession();
    window.addEventListener(SESSION_CHANGED_EVENT, loadSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, loadSession);
  }, [articleId, loadSession]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;

    setError("");
    setSubmitting(true);
    try {
      const { comment } = await apiFetch<{ comment: PostComment }>(
        `/api/posts/${articleId}/comments`,
        { method: "POST", json: { body }, toastOnError: false },
      );
      setComments((current) => [...(current ?? []), comment]);
      setBody("");
      showToast("Comment posted.", "success");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this comment?")) return;

    setDeletingId(id);
    try {
      await apiFetch(`/api/comments/${id}`, { method: "DELETE" });
      setComments((current) => (current ?? []).filter((comment) => comment.id !== id));
    } catch {
      // apiFetch already showed the error toast.
    } finally {
      setDeletingId(null);
    }
  }

  const count = comments?.length ?? 0;
  const isAdmin = canAccessAdmin(user?.role);

  return (
    <section aria-labelledby="comments-heading" className="mt-12 border-t border-border pt-8">
      <h2 id="comments-heading" className="text-2xl font-bold text-[#3a3a3a] md:text-[28px]">
        Comments{comments && count > 0 ? ` (${count})` : ""}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
          <UserAvatar gender={user.gender} src={user.avatarUrl} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <label htmlFor="comment-body" className="sr-only">
              Write a comment
            </label>
            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder="Share your thoughts..."
              className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-muted">
                Commenting as <span className="font-semibold text-navy">{user.name}</span>
                {body.length > MAX_LENGTH - 200 && ` · ${MAX_LENGTH - body.length} characters left`}
              </span>
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-lg bg-cream px-5 py-4 text-sm text-[#30384e]">
          <Link
            href={`/login?redirect=${encodeURIComponent(`/blog/${slug}`)}`}
            className="font-semibold text-gold-dark underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to join the discussion.
        </div>
      )}

      <div className="mt-8">
        {comments === null ? (
          <p className="text-sm text-muted">Loading comments...</p>
        ) : count === 0 ? (
          <p className="text-sm text-muted">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <ul className="space-y-6">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <UserAvatar gender={comment.gender} src={comment.avatarUrl} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-navy">{comment.name}</span>
                    <time dateTime={comment.createdAt} className="text-xs text-muted">
                      {formatCommentDate(comment.createdAt)}
                    </time>
                    {user && (comment.userId === user.id || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="ml-auto text-xs font-medium text-muted transition-colors hover:text-red-600 disabled:opacity-60"
                      >
                        {deletingId === comment.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-[15px] leading-relaxed text-[#30384e]">
                    {comment.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
