"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { contentToEditorHtml, stripHtml } from "@/lib/content";
import { isValidSlug, slugify } from "@/lib/slug";
import type { Article, BlogCategory, PostStatus } from "@/lib/types";
import { prepareImageForUpload } from "@/app/components/posts/prepareImageForUpload";
import RichTextEditor from "@/app/admin/components/RichTextEditor";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { showToast } from "@/lib/toast";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AUTOSAVE_KEY_PREFIX = "rankingpost-draft-";

interface PostFormProps {
  mode: "create" | "edit";
  article?: Article;
  authorName: string;
  redirectTo?: string;
}

function validateClientImage(image: string): string | null {
  if (!image.trim()) return "Featured image is required.";

  if (image.startsWith("data:")) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return "Invalid image data.";
    const [, mime, base64] = match;
    if (!ALLOWED_IMAGE_TYPES.includes(mime)) {
      return "Image must be JPEG, PNG, WebP, or GIF.";
    }
    const size = Math.ceil((base64.length * 3) / 4);
    if (size > MAX_IMAGE_BYTES) return "Image must be 4 MB or smaller.";
    return null;
  }

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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  async function handleImageUpload(file: File | null) {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Image must be JPEG, PNG, WebP, or GIF.");
      return;
    }

    setError("");
    setUploadingImage(true);

    try {
      const prepared = await prepareImageForUpload(file);
      if (prepared.size > MAX_IMAGE_BYTES) {
        setError("Image must be 4 MB or smaller.");
        return;
      }

      const body = new FormData();
      body.append("file", prepared);
      const { url } = await apiFetch<{ url: string }>("/api/images", { method: "POST", body });
      setImage(url);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setUploadingImage(false);
    }
  }

  async function submitPost(nextStatus: PostStatus) {
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
      router.push(redirectTo);
    } catch (error) {
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
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Featured Image *
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              disabled={uploadingImage}
              onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
            />
            <input
              value={image.startsWith("data:") ? "" : image}
              disabled={uploadingImage}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or paste an image URL"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            {image && (
              // Preview may be a pasted URL from any host or a local data URI.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Featured preview"
                className="h-40 w-full rounded-lg object-cover"
              />
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
            disabled={loading || uploadingImage}
            onClick={() => void submitPost("draft")}
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-navy hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Publishing..." : uploadingImage ? "Uploading image..." : "Publish Post"}
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
