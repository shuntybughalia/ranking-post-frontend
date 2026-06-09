import "server-only";
import { parseArticleContent, stripHtml } from "./content";
import { readJson, writeJson } from "./db";
import type { Article, ArticleCategory } from "./types";

const ARTICLES_FILE = "articles.json";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

async function getArticlesRaw(): Promise<Article[]> {
  return readJson<Article[]>(ARTICLES_FILE, []);
}

export async function getArticles(): Promise<Article[]> {
  const articles = await getArticlesRaw();
  return articles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
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
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  const articles = await getArticles();
  return articles.map((article) => article.slug);
}

export interface CreateArticleInput {
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  image: string;
  author: string;
  featured?: boolean;
}

export async function createArticle(
  input: CreateArticleInput,
): Promise<Article> {
  const articles = await getArticlesRaw();
  const paragraphs = parseArticleContent(input.content);

  let baseSlug = slugify(input.title);
  let slug = baseSlug;
  let counter = 1;

  while (articles.some((article) => article.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const now = new Date();
  const article: Article = {
    id: crypto.randomUUID(),
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: paragraphs,
    category: input.category,
    readTime: estimateReadTime(paragraphs),
    author: input.author.trim(),
    date: formatDate(now),
    image: input.image.trim(),
    featured: input.featured ?? false,
    createdAt: now.toISOString(),
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

export interface UpdateArticleInput {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: ArticleCategory;
  image?: string;
  featured?: boolean;
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
): Promise<Article | null> {
  const articles = await getArticlesRaw();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) return null;

  const existing = articles[index];

  if (input.title !== undefined) {
    existing.title = input.title.trim();
    let baseSlug = slugify(existing.title);
    let slug = baseSlug;
    let counter = 1;
    while (articles.some((a, i) => i !== index && a.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
    existing.slug = slug;
  }

  if (input.excerpt !== undefined) {
    existing.excerpt = input.excerpt.trim();
  }

  if (input.content !== undefined) {
    const paragraphs = parseArticleContent(input.content);
    existing.content = paragraphs;
    existing.readTime = estimateReadTime(paragraphs);
  }

  if (input.category !== undefined) {
    existing.category = input.category;
  }

  if (input.image !== undefined) {
    existing.image = input.image.trim();
  }

  if (input.featured !== undefined) {
    existing.featured = input.featured;
    if (input.featured) {
      articles.forEach((item, i) => {
        if (i !== index) item.featured = false;
      });
    }
  }

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
