import "server-only";
import { cache } from "react";
import { categoryNameToEnum, getCategoryById } from "./categories";
import { PUBLIC_PAGE_REVALIDATE } from "./cache-config";
import { parseArticleContent, stripHtml } from "./content";
import {
  incrementItemField,
  readJson,
  readJsonItem,
  readJsonWithout,
  writeJson,
} from "./db";
import {
  DEFAULT_IMAGE,
  compactArticleImage,
  persistArticleImage,
} from "./image-storage";
import { isValidSlug, slugify } from "./post-validation";
import { INTERNAL_LINK_REQUIRED, hasInternalLink } from "./internal-links";
import { sanitizeHtml } from "./sanitize";
import { syncTags } from "./tags";
import type {
  Article,
  ArticleCategory,
  ArticleListItem,
  CreatePostInput,
  PostStats,
  PostStatus,
  UpdatePostInput,
} from "./types";

const ARTICLES_FILE = "articles.json";
const ARTICLES_MEMORY_CACHE_TTL_MS = PUBLIC_PAGE_REVALIDATE * 1000;

type LegacyArticle = Partial<Article> & {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: ArticleCategory;
  readTime: string;
  author: string;
  date: string;
  image: string;
  createdAt: string;
};

let articlesMemoryCache: { articles: Article[]; expiresAt: number } | null =
  null;
let listingMemoryCache: { articles: Article[]; expiresAt: number } | null =
  null;
let articlesInflight: Promise<Article[]> | null = null;
// Last successful load, kept past its TTL so reads never block on (or fail with) a slow database.
let lastKnownArticles: Article[] | null = null;
// Bumped on every invalidation so a refresh that started before a write can't restore pre-write data.
let articlesGeneration = 0;

// Every article without its body content. The full store is several MB, so
// listing pages, the sitemap and dashboards read this much smaller copy.
let summariesMemoryCache: { articles: Article[]; expiresAt: number } | null = null;
let summariesInflight: Promise<Article[]> | null = null;
let lastKnownSummaries: Article[] | null = null;

function invalidateArticlesMemoryCache() {
  articlesMemoryCache = null;
  listingMemoryCache = null;
  lastKnownArticles = null;
  articlesInflight = null;
  summariesMemoryCache = null;
  summariesInflight = null;
  lastKnownSummaries = null;
  articlesGeneration += 1;
}

/** The full articles if they're already in memory, so lookups needn't hit the database. */
function fullArticlesInMemory(): Article[] | null {
  if (articlesMemoryCache && articlesMemoryCache.expiresAt > Date.now()) {
    return articlesMemoryCache.articles;
  }
  return lastKnownArticles;
}

function estimateReadTime(content: string[]): string {
  const text = content.map((c) => stripHtml(c)).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Posts whose upload was lost fall back to their first content image instead of the placeholder. */
function resolveFeaturedImage(raw: LegacyArticle): string {
  const image = compactArticleImage(raw.image);
  if (image !== DEFAULT_IMAGE) return image;

  // Summary reads omit content, so there's nothing to fall back to.
  if (!raw.content) return image;

  const match = raw.content.join(" ").match(/<img[^>]+src="(https:\/\/[^"]+)"/i);
  const candidate = match?.[1].replace(/&amp;/g, "&");
  return candidate && candidate.length <= 2048 && !candidate.startsWith(DEFAULT_IMAGE.split("?")[0])
    ? candidate
    : image;
}

function normalizeArticle(raw: LegacyArticle): Article {
  const createdAt = raw.createdAt;
  const categoryId = raw.categoryId ?? slugify(raw.category);

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content: raw.content ?? [],
    category: raw.category,
    categoryId,
    readTime: raw.readTime,
    author: raw.author,
    authorId: raw.authorId ?? "",
    date: raw.date,
    image: resolveFeaturedImage(raw),
    featured: raw.featured ?? false,
    tags: raw.tags ?? [],
    metaTitle: raw.metaTitle ?? raw.title,
    metaDescription: raw.metaDescription ?? raw.excerpt,
    faqs: raw.faqs ?? [],
    status: raw.status ?? "published",
    publishedAt: raw.publishedAt ?? createdAt,
    createdAt,
    updatedAt: raw.updatedAt ?? createdAt,
    rejectionReason: raw.rejectionReason,
    views: raw.views ?? 0,
  };
}

async function fetchArticlesRaw(): Promise<Article[]> {
  if (articlesMemoryCache && articlesMemoryCache.expiresAt > Date.now()) {
    return articlesMemoryCache.articles;
  }

  if (articlesInflight) {
    return articlesInflight;
  }

  const generation = articlesGeneration;
  const inflight = (async () => {
    const articles = await readJson<LegacyArticle[]>(ARTICLES_FILE, []);
    const normalized = articles.map(normalizeArticle);
    const deduped = dedupeArticles(normalized);
    const imagesCompacted = articles.some(
      (article) => article.image !== compactArticleImage(article.image),
    );

    // Rewrite once after compacting base64 images so Mongo stays small/fast.
    if (deduped.length !== normalized.length || imagesCompacted) {
      await writeJson(ARTICLES_FILE, deduped);
    }

    if (generation === articlesGeneration) {
      articlesMemoryCache = {
        articles: deduped,
        expiresAt: Date.now() + ARTICLES_MEMORY_CACHE_TTL_MS,
      };
      lastKnownArticles = deduped;
    }

    return deduped;
  })().finally(() => {
    if (articlesInflight === inflight) articlesInflight = null;
  });

  articlesInflight = inflight;
  return inflight;
}

/** Read path: serves the last good copy while refreshing in the background once the TTL expires. */
async function loadArticlesForRead(): Promise<Article[]> {
  if (articlesMemoryCache && articlesMemoryCache.expiresAt > Date.now()) {
    return articlesMemoryCache.articles;
  }

  if (lastKnownArticles) {
    fetchArticlesRaw().catch((error) => {
      console.warn(
        "Article refresh failed, serving cached copy:",
        error instanceof Error ? error.message : error,
      );
    });
    return lastKnownArticles;
  }

  return fetchArticlesRaw();
}

const getArticlesRaw = cache(loadArticlesForRead);

async function fetchSummariesRaw(): Promise<Article[]> {
  if (summariesMemoryCache && summariesMemoryCache.expiresAt > Date.now()) {
    return summariesMemoryCache.articles;
  }

  // Derive from the full articles when they're already loaded.
  const full = fullArticlesInMemory();
  if (full) return full.map(omitArticleContent);

  if (summariesInflight) return summariesInflight;

  const generation = articlesGeneration;
  const inflight = (async () => {
    const raw = await readJsonWithout<LegacyArticle>(ARTICLES_FILE, ["content"]);
    const summaries = dedupeArticles(raw.map(normalizeArticle));

    if (generation === articlesGeneration) {
      summariesMemoryCache = {
        articles: summaries,
        expiresAt: Date.now() + ARTICLES_MEMORY_CACHE_TTL_MS,
      };
      lastKnownSummaries = summaries;
    }
    return summaries;
  })().finally(() => {
    if (summariesInflight === inflight) summariesInflight = null;
  });

  summariesInflight = inflight;
  return inflight;
}

/** Like loadArticlesForRead, but for the content-free summaries. */
async function loadSummariesForRead(): Promise<Article[]> {
  if (summariesMemoryCache && summariesMemoryCache.expiresAt > Date.now()) {
    return summariesMemoryCache.articles;
  }

  if (lastKnownSummaries) {
    fetchSummariesRaw().catch((error) => {
      console.warn(
        "Article summary refresh failed, serving cached copy:",
        error instanceof Error ? error.message : error,
      );
    });
    return lastKnownSummaries;
  }

  return fetchSummariesRaw();
}

const getArticleSummaries = cache(loadSummariesForRead);

/** One article by a field, from memory when possible, otherwise just that item from storage. */
async function findArticle(field: "id" | "slug", value: string): Promise<Article | undefined> {
  const full = fullArticlesInMemory();
  if (full) return full.find((article) => article[field] === value);

  const raw = await readJsonItem<LegacyArticle>(ARTICLES_FILE, field, value);
  return raw ? normalizeArticle(raw) : undefined;
}

const findArticleCached = cache(findArticle);

function dedupeArticles(articles: Article[]): Article[] {
  const byId = new Map<string, Article>();

  for (const article of articles) {
    const existing = byId.get(article.id);
    if (!existing) {
      byId.set(article.id, article);
      continue;
    }

    const existingTime = new Date(existing.updatedAt).getTime();
    const currentTime = new Date(article.updatedAt).getTime();
    if (currentTime >= existingTime) {
      byId.set(article.id, article);
    }
  }

  const bySlug = new Map<string, Article>();

  for (const article of byId.values()) {
    const existing = bySlug.get(article.slug);
    if (!existing) {
      bySlug.set(article.slug, article);
      continue;
    }

    const existingTime = new Date(existing.updatedAt).getTime();
    const currentTime = new Date(article.updatedAt).getTime();
    if (currentTime >= existingTime) {
      bySlug.set(article.slug, article);
    }
  }

  return Array.from(bySlug.values());
}

function sortByNewest(articles: Article[]): Article[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime(),
  );
}

export async function getArticles(): Promise<Article[]> {
  const articles = await getArticlesRaw();
  return sortByNewest(articles.filter((a) => a.status === "published"));
}

function omitArticleContent(article: Article): Article {
  return { ...article, content: [] };
}

function listingImage(image: string): string {
  return compactArticleImage(image);
}

function toListingArticle(article: Article): Article {
  return {
    ...omitArticleContent(article),
    image: listingImage(article.image),
  };
}

/** Published articles without body content — for list/feed payloads. */
export async function getArticlesForListing(): Promise<Article[]> {
  if (listingMemoryCache && listingMemoryCache.expiresAt > Date.now()) {
    return listingMemoryCache.articles;
  }

  const summaries = await getArticleSummaries();
  const articles = sortByNewest(summaries.filter((a) => a.status === "published")).map(
    toListingArticle,
  );
  listingMemoryCache = {
    articles,
    expiresAt: Date.now() + ARTICLES_MEMORY_CACHE_TTL_MS,
  };
  return articles;
}

/** Minimal card data for listing pages, keeping page payloads small. */
export async function getArticleListItems(): Promise<ArticleListItem[]> {
  const articles = await getArticlesForListing();
  return articles.map(
    ({ id, slug, title, excerpt, category, readTime, author, date, image, featured, publishedAt, updatedAt }) => ({
      id,
      slug,
      title,
      excerpt,
      category,
      readTime,
      author,
      date,
      image,
      featured,
      publishedAt,
      updatedAt,
    }),
  );
}

export async function getAllArticles(): Promise<Article[]> {
  return sortByNewest(await getArticlesRaw());
}

export async function getArticlesByAuthorId(authorId: string): Promise<Article[]> {
  const articles = await getArticlesRaw();
  return sortByNewest(articles.filter((a) => a.authorId === authorId));
}

export async function getArticlesByAuthor(author: string): Promise<Article[]> {
  const articles = await getArticlesRaw();
  return sortByNewest(
    articles.filter((a) => a.author.toLowerCase() === author.toLowerCase()),
  );
}

export async function getPendingArticles(): Promise<Article[]> {
  const articles = await getArticlesRaw();
  return sortByNewest(articles.filter((a) => a.status === "pending"));
}

/** Every post (any status) without body content, newest first — for counts and dashboards. */
export async function getAllArticleSummaries(): Promise<Article[]> {
  return sortByNewest(await getArticleSummaries());
}

/**
 * Reads storage directly, so a post published moments ago counts even if this
 * server's cached list predates it.
 */
export async function authorHasPublishedPost(authorId: string): Promise<boolean> {
  const articles = await readJsonWithout<LegacyArticle>(ARTICLES_FILE, ["content"]);
  return articles.some(
    (article) => article.authorId === authorId && (article.status ?? "published") === "published",
  );
}

/** An author's posts without body content — for lists, counts and notifications. */
export async function getArticleSummariesByAuthorId(authorId: string): Promise<Article[]> {
  const articles = await getArticleSummaries();
  return sortByNewest(articles.filter((a) => a.authorId === authorId));
}

export async function getArticleById(
  id: string,
): Promise<Article | undefined> {
  return findArticleCached("id", id);
}

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const article = await findArticleCached("slug", slug);
  if (!article || article.status !== "published") return undefined;
  return article;
}

export async function getAdjacentArticles(slug: string): Promise<{
  previous: Article | null;
  next: Article | null;
}> {
  const articles = await getArticlesForListing();
  const index = articles.findIndex((article) => article.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export async function incrementArticleViews(id: string): Promise<void> {
  await incrementItemField(ARTICLES_FILE, id, "views");

  // Keep the warm caches in sync instead of forcing a full reload from storage.
  const cached = articlesMemoryCache?.articles.find((article) => article.id === id);
  if (cached) cached.views += 1;
  const summary = summariesMemoryCache?.articles.find((article) => article.id === id);
  if (summary) summary.views += 1;
}

export async function getPostStats(authorId?: string): Promise<PostStats> {
  const articles = authorId
    ? await getArticleSummariesByAuthorId(authorId)
    : await getArticleSummaries();

  return {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
    pending: articles.filter((a) => a.status === "pending").length,
    rejected: articles.filter((a) => a.status === "rejected").length,
    views: articles.reduce((sum, a) => sum + a.views, 0),
  };
}

async function resolveUniqueSlug(
  requestedSlug: string | undefined,
  title: string,
  articles: Article[],
  excludeId?: string,
): Promise<string> {
  const baseSlug = requestedSlug?.trim() || slugify(title);

  if (!baseSlug) {
    throw new Error("Slug is required.");
  }

  if (!isValidSlug(baseSlug)) {
    throw new Error(
      "Slug must contain only lowercase letters, numbers, and hyphens.",
    );
  }

  let slug = baseSlug;
  let counter = 1;

  while (articles.some((a) => a.slug === slug && a.id !== excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function resolveCategory(
  categoryId: string,
): Promise<{ categoryId: string; category: ArticleCategory }> {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new Error("Invalid category.");
  }

  return {
    categoryId: category.id,
    category: categoryNameToEnum(category.name),
  };
}

function resolvePublishDate(
  status: PostStatus,
  publishedAt?: string | null,
): string | null {
  if (status !== "published") return publishedAt ?? null;
  return publishedAt ?? new Date().toISOString();
}

let articleWriteQueue: Promise<unknown> = Promise.resolve();

/**
 * Runs article writes one at a time. Each write rewrites the whole article
 * list, so overlapping requests (e.g. a double-clicked Publish) would otherwise
 * miss each other: the second copy got a "-1" slug and was saved as a duplicate.
 */
function withArticleWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = articleWriteQueue.then(task, task);
  articleWriteQueue = run.catch(() => undefined);
  return run;
}

function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Body text this short is too generic to call a duplicate on its own. */
const MIN_DUPLICATE_CONTENT_CHARS = 80;

/** Throws when another post already has the same title or the same body text. */
function assertNotDuplicate(
  articles: Article[],
  title: string,
  sanitizedContent: string,
  excludeId?: string,
) {
  const normalizedTitle = normalizeForCompare(title);
  const normalizedContent = normalizeForCompare(stripHtml(sanitizedContent));
  const compareContent = normalizedContent.length >= MIN_DUPLICATE_CONTENT_CHARS;

  for (const article of articles) {
    if (article.id === excludeId) continue;

    if (normalizedTitle && normalizeForCompare(article.title) === normalizedTitle) {
      throw new Error("A post with this title already exists. Please use a different title.");
    }
    if (
      compareContent &&
      normalizeForCompare(stripHtml(article.content.join(" "))) === normalizedContent
    ) {
      throw new Error(`This content is already published as "${article.title}".`);
    }
  }
}

export function createArticle(input: CreatePostInput): Promise<Article> {
  return withArticleWriteLock(() => createArticleUnlocked(input));
}

async function createArticleUnlocked(input: CreatePostInput): Promise<Article> {
  invalidateArticlesMemoryCache();
  const articles = await fetchArticlesRaw();
  const sanitizedContent = sanitizeHtml(input.content.trim());
  assertNotDuplicate(articles, input.title, sanitizedContent);
  if (input.status !== "draft" && !hasInternalLink(sanitizedContent)) {
    throw new Error(INTERNAL_LINK_REQUIRED);
  }
  const paragraphs = parseArticleContent(sanitizedContent);
  const slug = await resolveUniqueSlug(input.slug, input.title, articles);
  const { categoryId, category } = await resolveCategory(input.categoryId);
  const tags = await syncTags(input.tags ?? []);
  const now = new Date();
  const publishedAt = resolvePublishDate(input.status, input.publishedAt);

  const article: Article = {
    id: crypto.randomUUID(),
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: paragraphs,
    category,
    categoryId,
    readTime: estimateReadTime(paragraphs),
    author: input.author.trim(),
    authorId: input.authorId,
    date: publishedAt ? formatDate(new Date(publishedAt)) : formatDate(now),
    image: await persistArticleImage(input.image.trim() || DEFAULT_IMAGE),
    featured: input.featured ?? false,
    tags,
    metaTitle: input.metaTitle?.trim() || input.title.trim(),
    metaDescription: input.metaDescription?.trim() || input.excerpt.trim(),
    faqs: input.faqs ?? [],
    status: input.status,
    publishedAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    views: 0,
  };

  if (article.featured) {
    articles.forEach((item) => {
      item.featured = false;
    });
  }

  articles.push(article);
  await writeJson(ARTICLES_FILE, articles);
  invalidateArticlesMemoryCache();
  return article;
}

export function updateArticle(id: string, input: UpdatePostInput): Promise<Article | null> {
  return withArticleWriteLock(() => updateArticleUnlocked(id, input));
}

async function updateArticleUnlocked(
  id: string,
  input: UpdatePostInput,
): Promise<Article | null> {
  invalidateArticlesMemoryCache();
  const articles = await fetchArticlesRaw();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) return null;

  const existing = articles[index];

  // Validate before mutating: `existing` is the cached object.
  if (input.title !== undefined || input.content !== undefined) {
    const sanitizedContent =
      input.content !== undefined
        ? sanitizeHtml(input.content.trim())
        : existing.content.join("\n");
    assertNotDuplicate(articles, input.title ?? existing.title, sanitizedContent, id);

    // Status-only changes (admin approve/reject) skip this so older posts can still be moderated.
    const nextStatus = input.status ?? existing.status;
    if (input.content !== undefined && nextStatus !== "draft" && !hasInternalLink(sanitizedContent)) {
      throw new Error(INTERNAL_LINK_REQUIRED);
    }
  }

  if (input.title !== undefined) {
    existing.title = input.title.trim();
  }

  if (input.slug !== undefined || input.title !== undefined) {
    existing.slug = await resolveUniqueSlug(
      input.slug ?? existing.slug,
      existing.title,
      articles,
      id,
    );
  }

  if (input.excerpt !== undefined) {
    existing.excerpt = input.excerpt.trim();
  }

  if (input.content !== undefined) {
    const sanitizedContent = sanitizeHtml(input.content.trim());
    const paragraphs = parseArticleContent(sanitizedContent);
    existing.content = paragraphs;
    existing.readTime = estimateReadTime(paragraphs);
  }

  if (input.categoryId !== undefined) {
    const resolved = await resolveCategory(input.categoryId);
    existing.categoryId = resolved.categoryId;
    existing.category = resolved.category;
  }

  if (input.image !== undefined) {
    existing.image = await persistArticleImage(
      input.image.trim() || DEFAULT_IMAGE,
    );
  }

  if (input.tags !== undefined) {
    existing.tags = await syncTags(input.tags);
  }

  if (input.metaTitle !== undefined) {
    existing.metaTitle = input.metaTitle.trim() || existing.title;
  }

  if (input.metaDescription !== undefined) {
    existing.metaDescription =
      input.metaDescription.trim() || existing.excerpt;
  }

  if (input.faqs !== undefined) {
    existing.faqs = input.faqs;
  }

  if (input.status !== undefined) {
    existing.status = input.status;
    existing.publishedAt = resolvePublishDate(
      input.status,
      input.publishedAt ?? existing.publishedAt,
    );
    if (existing.publishedAt) {
      existing.date = formatDate(new Date(existing.publishedAt));
    }
  } else if (input.publishedAt !== undefined) {
    existing.publishedAt = input.publishedAt;
    if (existing.publishedAt) {
      existing.date = formatDate(new Date(existing.publishedAt));
    }
  }

  if (input.rejectionReason !== undefined) {
    existing.rejectionReason = input.rejectionReason.trim() || undefined;
  }

  if (input.featured !== undefined) {
    existing.featured = input.featured;
    if (input.featured) {
      articles.forEach((item, i) => {
        if (i !== index) item.featured = false;
      });
    }
  }

  existing.updatedAt = new Date().toISOString();
  articles[index] = existing;
  await writeJson(ARTICLES_FILE, articles);
  invalidateArticlesMemoryCache();
  return existing;
}

export function deleteArticle(id: string): Promise<boolean> {
  return withArticleWriteLock(() => deleteArticleUnlocked(id));
}

async function deleteArticleUnlocked(id: string): Promise<boolean> {
  invalidateArticlesMemoryCache();
  const articles = await fetchArticlesRaw();
  const filtered = articles.filter((article) => article.id !== id);

  if (filtered.length === articles.length) return false;

  await writeJson(ARTICLES_FILE, filtered);
  invalidateArticlesMemoryCache();
  return true;
}

export async function approveArticle(id: string): Promise<Article | null> {
  return updateArticle(id, {
    status: "published",
    publishedAt: new Date().toISOString(),
    rejectionReason: "",
  });
}

export async function rejectArticle(
  id: string,
  reason: string,
): Promise<Article | null> {
  return updateArticle(id, {
    status: "rejected",
    rejectionReason: reason.trim() || "Rejected by admin.",
  });
}

export type { CreatePostInput, UpdatePostInput };
