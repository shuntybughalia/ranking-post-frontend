"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { INTERNAL_LINK_REQUIRED, hasInternalLink } from "@/lib/internal-links";
import { contentToEditorHtml, stripHtml } from "@/lib/content";
import { showToast } from "@/lib/toast";
import { articleCategories } from "@/lib/types";
import type { Article, FaqItem } from "@/lib/types";
import FaqEditor from "@/app/components/posts/FaqEditor";
import ImageUploadButton from "@/app/components/posts/ImageUploadButton";
import RichTextEditor from "./RichTextEditor";

interface ArticleFormProps {
  mode: "create" | "edit";
  article?: Article;
}

export default function ArticleForm({ mode, article }: ArticleFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [image, setImage] = useState(article?.image ?? "");
  const [faqs, setFaqs] = useState<FaqItem[]>(article?.faqs ?? []);
  const [content, setContent] = useState(() =>
    contentToEditorHtml(article?.content ?? []),
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // A ref, not `loading`: a fast double click fires twice before React re-renders.
    if (submittingRef.current) return;
    setError("");

    if (!stripHtml(content)) {
      setError("Article content is required.");
      return;
    }

    if (!hasInternalLink(content)) {
      setError(INTERNAL_LINK_REQUIRED);
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      excerpt: form.get("excerpt"),
      content,
      category: form.get("category"),
      image,
      faqs,
      featured: form.get("featured") === "on",
    };

    try {
      const url =
        mode === "create" ? "/api/articles" : `/api/articles/${article!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      await apiFetch(url, { method, json: payload });
      showToast(mode === "create" ? "Article created." : "Article updated.", "success");
      // Stay locked while navigating away so the saved article can't be sent again.
      router.push("/admin/articles");
    } catch (error) {
      submittingRef.current = false;
      setError(getErrorMessage(error));
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
          <p className="mt-2 text-xs text-muted">
            Include at least one internal link to another RankingPost page (for example /blog/your-post).
          </p>
        </div>

        <div>
          <p className="mb-1.5 block text-sm font-medium text-navy">FAQs</p>
          <p className="mb-3 text-xs text-muted">
            Optional. Shown as an accordion at the end of the article.
          </p>
          <FaqEditor value={faqs} onChange={setFaqs} />
        </div>

        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-navy">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={article?.category ?? articleCategories[0]}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:max-w-sm"
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
            Cover image
          </label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                id="image"
                name="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value.trim())}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <ImageUploadButton onUploaded={setImage} disabled={loading} />
            </div>
            <p className="text-xs text-muted">
              Upload a JPEG, PNG, WebP or GIF (up to 4 MB), or paste a direct link to one.
            </p>
            {image && (
              // Preview may come from any host, so next/image can't optimise it.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Cover preview" className="max-h-80 w-full rounded-lg bg-slate-100 object-contain" />
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={article?.featured}
            className="h-4 w-4 rounded border-border text-gold-dark focus:ring-accent"
          />
          Feature this article on the homepage
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60"
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
