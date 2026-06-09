"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { contentToEditorHtml, stripHtml } from "@/lib/content";
import { articleCategories } from "@/lib/types";
import type { Article } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";

interface ArticleFormProps {
  mode: "create" | "edit";
  article?: Article;
}

export default function ArticleForm({ mode, article }: ArticleFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(() =>
    contentToEditorHtml(article?.content ?? []),
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!stripHtml(content)) {
      setError("Article content is required.");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      excerpt: form.get("excerpt"),
      content,
      category: form.get("category"),
      image: form.get("image"),
      featured: form.get("featured") === "on",
    };

    try {
      const url =
        mode === "create" ? "/api/articles" : `/api/articles/${article!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Failed to ${mode} article.`);
        return;
      }

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-navy">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={article?.title}
            placeholder="Article title"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-navy">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={2}
            defaultValue={article?.excerpt}
            placeholder="Short summary shown on cards"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Content
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your article. Use the toolbar to format text like a Word document."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-navy">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={article?.category ?? articleCategories[0]}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              {articleCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-navy">
              Cover image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              defaultValue={article?.image}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={article?.featured}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          Feature this article on the homepage
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-60"
          >
            {loading
              ? mode === "create"
                ? "Publishing..."
                : "Saving..."
              : mode === "create"
                ? "Publish Article"
                : "Save Changes"}
          </button>
          <Link
            href="/admin/articles"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
