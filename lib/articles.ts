import "server-only";
import { categoryNameToEnum, getCategoryById } from "./categories";
import { parseArticleContent, stripHtml } from "./content";
import { readJson, writeJson } from "./db";
import { isValidSlug, slugify } from "./post-validation";
import { sanitizeHtml } from "./sanitize";
import { syncTags } from "./tags";
import type {
  Article,
  ArticleCategory,
  CreatePostInput,
  PostStats,
  PostStatus,
  UpdatePostInput,
} from "./types";

const ARTICLES_FILE = "articles.json";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

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

function estimateReadTime(content: string[]): string {
  const text = content.map((c) => stripHtml(c)).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function normalizeArticle(raw: LegacyArticle): Article {
  const createdAt = raw.createdAt;
  const categoryId = raw.categoryId ?? slugify(raw.category);

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content: raw.content,
    category: raw.category,
    categoryId,
    readTime: raw.readTime,
    author: raw.author,
    authorId: raw.authorId ?? "",
    date: raw.date,
    image: raw.image,
    featured: raw.featured ?? false,
    tags: raw.tags ?? [],
    metaTitle: raw.metaTitle ?? raw.title,
    metaDescription: raw.metaDescription ?? raw.excerpt,
    status: raw.status ?? "published",
    publishedAt: raw.publishedAt ?? createdAt,
    createdAt,
    updatedAt: raw.updatedAt ?? createdAt,
    rejectionReason: raw.rejectionReason,
    views: raw.views ?? 0,
  };
}

async function getArticlesRaw(): Promise<Article[]> {
  const articles = await readJson<LegacyArticle[]>(ARTICLES_FILE, []);
  const normalized = articles.map(normalizeArticle);
  const deduped = dedupeArticles(normalized);

  if (deduped.length !== normalized.length) {
    await writeJson(ARTICLES_FILE, deduped);
  }

  return deduped;
}

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

export async function getArticleById(
  id: string,
): Promise<Article | undefined> {
  const articles = await getArticlesRaw();
  return articles.find((article) => article.id === id);
}

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const articles = await getArticlesRaw();
  const article = articles.find((item) => item.slug === slug);
  if (!article || article.status !== "published") return undefined;
  return article;
}

export async function getArticleBySlugAdmin(
  slug: string,
): Promise<Article | undefined> {
  const articles = await getArticlesRaw();
  return articles.find((item) => item.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  const articles = await getArticles();
  return articles.map((article) => article.slug);
}

export async function isSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const articles = await getArticlesRaw();
  return articles.some(
    (article) => article.slug === slug && article.id !== excludeId,
  );
}

export async function getAdjacentArticles(slug: string): Promise<{
  previous: Article | null;
  next: Article | null;
}> {
  const articles = await getArticles();
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
  const articles = await getArticlesRaw();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) return;

  articles[index].views += 1;
  articles[index].updatedAt = new Date().toISOString();
  await writeJson(ARTICLES_FILE, articles);
}

export async function getPostStats(authorId?: string): Promise<PostStats> {
  const articles = authorId
    ? await getArticlesByAuthorId(authorId)
    : await getArticlesRaw();

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
  let baseSlug = requestedSlug?.trim() || slugify(title);

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

export async function createArticle(input: CreatePostInput): Promise<Article> {
  const articles = await getArticlesRaw();
  const sanitizedContent = sanitizeHtml(input.content.trim());
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
    image: input.image.trim() || DEFAULT_IMAGE,
    featured: input.featured ?? false,
    tags,
    metaTitle: input.metaTitle?.trim() || input.title.trim(),
    metaDescription: input.metaDescription?.trim() || input.excerpt.trim(),
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
  return article;
}

export async function updateArticle(
  id: string,
  input: UpdatePostInput,
): Promise<Article | null> {
  const articles = await getArticlesRaw();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) return null;

  const existing = articles[index];

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
    existing.image = input.image.trim() || DEFAULT_IMAGE;
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
  return existing;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const articles = await getArticlesRaw();
  const filtered = articles.filter((article) => article.id !== id);

  if (filtered.length === articles.length) return false;

  await writeJson(ARTICLES_FILE, filtered);
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
