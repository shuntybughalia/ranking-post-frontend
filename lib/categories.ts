import "server-only";
import { readJson, writeJson } from "./db";
import { slugify } from "./post-validation";
import { articleCategories } from "./types";
import type { ArticleCategory, BlogCategory } from "./types";

const CATEGORIES_FILE = "categories.json";

function defaultCategories(): BlogCategory[] {
  const now = new Date().toISOString();
  return articleCategories.map((name) => ({
    id: slugify(name),
    name,
    slug: slugify(name),
    createdAt: now,
  }));
}

export async function getCategories(): Promise<BlogCategory[]> {
  const categories = await readJson<BlogCategory[]>(
    CATEGORIES_FILE,
    defaultCategories(),
  );

  if (categories.length === 0) {
    const seeded = defaultCategories();
    await writeJson(CATEGORIES_FILE, seeded);
    return seeded;
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategoryById(
  id: string,
): Promise<BlogCategory | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.id === id);
}

export async function createCategory(
  name: string,
  description?: string,
): Promise<BlogCategory> {
  const categories = await getCategories();
  const trimmed = name.trim();
  const slug = slugify(trimmed);

  if (categories.some((c) => c.slug === slug)) {
    throw new Error("A category with this name already exists.");
  }

  const category: BlogCategory = {
    id: crypto.randomUUID(),
    name: trimmed,
    slug,
    description: description?.trim(),
    createdAt: new Date().toISOString(),
  };

  categories.push(category);
  await writeJson(CATEGORIES_FILE, categories);
  return category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getCategories();
  const filtered = categories.filter((category) => category.id !== id);

  if (filtered.length === categories.length) return false;

  await writeJson(CATEGORIES_FILE, filtered);
  return true;
}

export function categoryNameToEnum(name: string): ArticleCategory {
  if (articleCategories.includes(name as ArticleCategory)) {
    return name as ArticleCategory;
  }

  return "SEO";
}
