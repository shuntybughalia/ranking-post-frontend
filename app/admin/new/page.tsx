"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { articleCategories } from "@/lib/types";

export default function NewArticlePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          excerpt: form.get("excerpt"),
          content: form.get("content"),
          category: form.get("category"),
          image: form.get("image"),
          featured: form.get("featured") === "on",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to publish article.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-navy"
      >
        ← Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-navy">Publish New Article</h1>
      <p className="mt-1 text-sm text-muted">
        Your article will appear on the homepage and blog immediately.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-navy">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
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
            placeholder="Short summary shown on cards"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-navy">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={12}
            placeholder="Write your article. Separate paragraphs with blank lines."
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
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
            {loading ? "Publishing..." : "Publish Article"}
          </button>
          <Link
            href="/admin"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
