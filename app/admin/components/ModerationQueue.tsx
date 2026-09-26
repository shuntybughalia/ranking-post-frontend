"use client";

import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { useToast } from "@/app/components/Toast";

interface ModerationQueueProps {
  articles: Article[];
}

export default function ModerationQueue({ articles: initialArticles }: ModerationQueueProps) {
  const { showToast } = useToast();
  const [articles, setArticles] = useState(initialArticles);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/posts/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to approve post.", "error");
        return;
      }
      setArticles((current) => current.filter((article) => article.id !== id));
      showToast("Post approved and published.", "success");
    } catch {
      showToast("Failed to approve post.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Rejection reason (optional):") ?? "Rejected by admin.";
    setLoadingId(id);
    try {
      const res = await fetch(`/api/posts/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to reject post.", "error");
        return;
      }
      setArticles((current) => current.filter((article) => article.id !== id));
      showToast("Post rejected.", "success");
    } catch {
      showToast("Failed to reject post.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-muted">
        No posts waiting for review.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">{article.title}</h2>
              <p className="mt-1 text-sm text-muted">
                By {article.author} · {article.category}
              </p>
              <p className="mt-3 text-sm text-muted">{article.excerpt}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/${article.id}/edit`}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-slate-50"
              >
                Review
              </Link>
              <button
                type="button"
                disabled={loadingId === article.id}
                onClick={() => void handleApprove(article.id)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={loadingId === article.id}
                onClick={() => void handleReject(article.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
