"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import DeleteArticleButton from "../DeleteArticleButton";
import ArticleModerationActions from "./ArticleModerationActions";

interface ArticleSearchProps {
  articles: Article[];
}

export default function ArticleSearch({ articles }: ArticleSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return articles;
    const q = query.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q),
    );
  }, [articles, query]);

  return (
    <>
      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles by title, category, or author..."
          className="w-full max-w-md rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">
            {query ? "No articles match your search." : "No articles yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-navy">Title</th>
                  <th className="px-6 py-4 font-semibold text-navy">Category</th>
                  <th className="px-6 py-4 font-semibold text-navy">Status</th>
                  <th className="hidden px-6 py-4 font-semibold text-navy md:table-cell">
                    Author
                  </th>
                  <th className="px-6 py-4 font-semibold text-navy">Date</th>
                  <th className="px-6 py-4 font-semibold text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/blog/${article.slug}`}
                          className="font-medium text-navy hover:underline"
                          target="_blank"
                        >
                          {article.title}
                        </Link>
                        {article.status !== "published" && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted">
                            {article.status}
                          </span>
                        )}
                        {article.featured && (
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-navy">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">{article.category}</td>
                    <td className="px-6 py-4 capitalize text-muted">{article.status}</td>
                    <td className="hidden px-6 py-4 text-muted md:table-cell">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 text-muted">{article.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <ArticleModerationActions
                          id={article.id}
                          status={article.status}
                        />
                        <Link
                          href={`/admin/${article.id}/edit`}
                          className="text-sm font-medium text-navy hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteArticleButton id={article.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
