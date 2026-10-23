"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { contentToEditorHtml, stripHtml } from "@/lib/content";
import { isValidSlug, slugify } from "@/lib/slug";
import type { Article, BlogCategory, FaqItem, PostStatus } from "@/lib/types";
import RichTextEditor from "@/app/admin/components/RichTextEditor";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { INTERNAL_LINK_REQUIRED, hasInternalLink } from "@/lib/internal-links";
import { showToast } from "@/lib/toast";
import FaqEditor from "./FaqEditor";
import ImageUploadButton from "./ImageUploadButton";

const AUTOSAVE_KEY_PREFIX = "rankingpost-draft-";

interface PostFormProps {
  mode: "create" | "edit";
  article?: Article;
  authorName: string;
  redirectTo?: string;
}

function validateClientImage(image: string): string | null {
  if (!image.trim()) return "Featured image is required.";

  // Older posts keep images stored by the site itself (MongoDB or local uploads).
  if (/^\/(api\/images|uploads)\/[\w.-]+$/.test(image)) return null;

  try {
    const url = new URL(image);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "Image URL must use http or https.";
    }
  } catch {
    return "Invalid image URL.";
  }

  return null;
}

export default function PostForm({
  mode,
  article,
  authorName,
  redirectTo = "/my-posts",
}: PostFormProps) {
  const router = useRouter();
  const autosaveTimer = useRef<number | null>(null);
  const submittingRef = useRef(false);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(article?.slug));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [image, setImage] = useState(article?.image ?? "");
  const [tags, setTags] = useState(article?.tags.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    article?.metaDescription ?? "",
  );
  const [faqs, setFaqs] = useState<FaqItem[]>(article?.faqs ?? []);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt?.slice(0, 16) ??
      new Date().toISOString().slice(0, 16),
  );
  const [content, setContent] = useState(() =>
    contentToEditorHtml(article?.content ?? []),
  );

  const autosaveKey = `${AUTOSAVE_KEY_PREFIX}${mode}-${article?.id ?? "new"}`;

  // Load categories once; default to the first one when nothing is selected yet.
  useEffect(() => {
    apiFetch<{ categories?: BlogCategory[] }>("/api/categories")
      .then((data) => {
        const loaded = data.categories ?? [];
        setCategories(loaded);
        setCategoryId((current) => current || loaded[0]?.id || "");
      })
      .catch(() => setError("Failed to load categories."));
  }, []);

  // Drafts live in localStorage, which only exists after hydration.
  useEffect(() => {
    if (mode !== "create") return;
    const saved = localStorage.getItem(autosaveKey);
    if (!saved) return;

    try {
      const draft = JSON.parse(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage
      setTitle(draft.title ?? "");
      setSlug(draft.slug ?? "");
      setSlugEdited(Boolean(draft.slugEdited));
      setExcerpt(draft.excerpt ?? "");
      setCategoryId(draft.categoryId ?? "");
      setImage(draft.image ?? "");
      setTags(draft.tags ?? "");
      setMetaTitle(draft.metaTitle ?? "");
      setMetaDescription(draft.metaDescription ?? "");
      setFaqs(Array.isArray(draft.faqs) ? draft.faqs : []);
      setPublishedAt(draft.publishedAt ?? new Date().toISOString().slice(0, 16));
      setContent(draft.content ?? "");
    } catch {
      localStorage.removeItem(autosaveKey);
    }
  }, [autosaveKey, mode]);

  const draftPayload = useMemo(
    () => ({
      title,
      slug,
      slugEdited,
      excerpt,
      categoryId,
      image,
      tags,
      metaTitle,
      metaDescription,
      faqs,
      publishedAt,
      content,
    }),
    [
      title,
      slug,
      slugEdited,
      excerpt,
      categoryId,
      image,
      tags,
      metaTitle,
      metaDescription,
      faqs,
      publishedAt,
      content,
    ],
  );

  useEffect(() => {
    if (mode !== "create") return;

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = window.setTimeout(() => {
      setAutosaving(true);
      localStorage.setItem(autosaveKey, JSON.stringify(draftPayload));
      window.setTimeout(() => setAutosaving(false), 600);
    }, 1200);

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [autosaveKey, draftPayload, mode]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function handleImageChange(value: string) {
    setImage(value.trim());
    setImagePreviewFailed(false);
  }

  async function submitPost(nextStatus: PostStatus) {
    // A ref, not `loading`: a fast double click fires twice before React re-renders.
    if (submittingRef.current) return;
    setError("");

    if (!title.trim() || !excerpt.trim() || !stripHtml(content)) {
      setError("Title, excerpt, and content are required.");
      return;
    }

    if (!categoryId) {
      setError("Category is required.");
      return;
    }

    if (!slug.trim() || !isValidSlug(slug.trim())) {
      setError("Slug must contain only lowercase letters, numbers, and hyphens.");
      return;
    }

    const imageError = validateClientImage(image);
    if (imageError) {
      setError(imageError);
      return;
    }

    if (nextStatus !== "draft" && !hasInternalLink(content)) {
      setError(INTERNAL_LINK_REQUIRED);
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    const payload = {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      image,
      tags,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      faqs,
      status: nextStatus,
      publishedAt:
        nextStatus === "published" ? new Date(publishedAt).toISOString() : null,
    };

    try {
      const url =
        mode === "create" ? "/api/posts" : `/api/posts/${article!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      await apiFetch(url, { method, json: payload });

      if (mode === "create") {
        localStorage.removeItem(autosaveKey);
      }

      showToast(
        nextStatus === "draft" ? "Draft saved successfully." : "Post published successfully.",
        "success",
      );
      // Stay locked while navigating away so the saved post can't be sent again.
      router.push(redirectTo);
    } catch (error) {
      submittingRef.current = false;
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitPost("published");
  }

  return (
    <>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {autosaving && (
        <p className="mb-4 text-sm text-muted">Auto-saving draft...</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-navy">
            Blog Title *
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            placeholder="Enter your blog title"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-navy">
            Slug *
          </label>
          <input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            required
            placeholder="seo-friendly-url"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-navy">
            Featured Image *
          </label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                id="image"
                type="url"
                inputMode="url"
                value={image.startsWith("data:") ? "" : image}
                onChange={(e) => handleImageChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <ImageUploadButton onUploaded={handleImageChange} disabled={loading} />
            </div>
            <p className="text-xs text-muted">
              Upload a JPEG, PNG, WebP or GIF (up to 4 MB), or paste a direct link to one.
            </p>
            {image && !imagePreviewFailed && (
              // Preview is a pasted URL from any host, so next/image can't optimise it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Featured preview"
                onError={() => setImagePreviewFailed(true)}
                className="max-h-80 w-full rounded-lg bg-slate-100 object-contain"
              />
            )}
            {image && imagePreviewFailed && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                Couldn&apos;t load an image from this URL. Check that it links directly to an image.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="mb-1.5 block text-sm font-medium text-navy">
              Category *
            </label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-navy">
              Author
            </label>
            <input
              id="author"
              value={authorName}
              readOnly
              className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-muted"
            />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-navy">
            Short Description / Excerpt *
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={3}
            placeholder="Brief summary for cards and SEO"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Content *
          </label>
          <RichTextEditor value={content} onChange={setContent} />
          <p className="mt-2 text-xs text-muted">
            Include at least one internal link to another RankingPost page (select text, click the
            link button, and enter a URL like /blog/your-post).
          </p>
        </div>

        <div>
          <p className="mb-1.5 block text-sm font-medium text-navy">FAQs</p>
          <p className="mb-3 text-xs text-muted">
            Optional. Shown as an accordion at the end of the post.
          </p>
          <FaqEditor value={faqs} onChange={setFaqs} />
        </div>

        <div>
          <label htmlFor="tags" className="mb-1.5 block text-sm font-medium text-navy">
            Tags
          </label>
          <input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="seo, marketing, guest-posting"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="grid gap-6">
          <div>
            <label htmlFor="metaTitle" className="mb-1.5 block text-sm font-medium text-navy">
              Meta Title
            </label>
            <input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Defaults to blog title"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="metaDescription" className="mb-1.5 block text-sm font-medium text-navy">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="Defaults to excerpt"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label htmlFor="publishedAt" className="mb-1.5 block text-sm font-medium text-navy">
              Publish Date
            </label>
            <input
              id="publishedAt"
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void submitPost("draft")}
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-navy hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
          <Link
            href={redirectTo}
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
