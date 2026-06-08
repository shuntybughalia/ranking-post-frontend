import "server-only";
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
  const words = content.join(" ").split(/\s+/).filter(Boolean).length;
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
  const paragraphs = input.content
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    throw new Error("Article content is required.");
  }

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

export async function deleteArticle(id: string): Promise<boolean> {
  const articles = await getArticlesRaw();
  const filtered = articles.filter((article) => article.id !== id);

  if (filtered.length === articles.length) return false;

  await writeJson(ARTICLES_FILE, filtered);
  return true;
}
