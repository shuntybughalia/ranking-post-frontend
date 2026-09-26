"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Article, PostStats } from "@/lib/types";
import ConfirmModal from "@/app/components/ConfirmModal";
import PostStatsCards from "@/app/components/PostStatsCards";
import { useToast } from "@/app/components/Toast";

interface MyPostsDashboardProps {
  initialArticles: Article[];
  initialStats: PostStats;
}

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function MyPostsDashboard({
  initialArticles,
  initialStats,
}: MyPostsDashboardProps) {
  const { showToast } = useToast();
  const [articles, setArticles] = useState(initialArticles);
  const [stats] = useState(initialStats);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchesQuery =
        !query.trim() ||
        article.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [articles, query, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/posts/${deleteId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "Failed to delete post.", "error");
        return;
      }

      setArticles((current) => current.filter((article) => article.id !== deleteId));
      showToast("Post deleted successfully.", "success");
      setDeleteId(null);
    } catch {
      showToast("Failed to delete post.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Posts</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your drafts, submissions, and published articles.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-navy hover:opacity-90"
        >
          Write a Post
        </Link>
      </div>

      <PostStatsCards stats={stats} />

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts by title..."
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 md:max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted">
            No posts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-navy">Title</th>
                  <th className="px-6 py-4 font-semibold text-navy">Status</th>
                  <th className="px-6 py-4 font-semibold text-navy">Category</th>
                  <th className="px-6 py-4 font-semibold text-navy">Updated</th>
                  <th className="px-6 py-4 font-semibold text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => (
                  <tr key={article.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-navy">{article.title}</p>
                        {article.rejectionReason && (
                          <p className="mt-1 text-xs text-red-600">
                            {article.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[article.status]}`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">{article.category}</td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.status === "published" && (
                          <Link
                            href={`/blog/${article.slug}`}
                            className="text-sm font-medium text-navy hover:underline"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/my-posts/${article.id}/edit`}
                          className="text-sm font-medium text-navy hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(article.id)}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete post?"
        message="This action cannot be undone."
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
