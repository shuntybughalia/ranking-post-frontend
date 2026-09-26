import "server-only";
import { readJson, writeJson } from "./db";
import { slugify } from "./post-validation";
import type { BlogTag } from "./types";

const TAGS_FILE = "tags.json";

export async function getTags(): Promise<BlogTag[]> {
  return readJson<BlogTag[]>(TAGS_FILE, []);
}

export async function syncTags(tagNames: string[]): Promise<string[]> {
  const normalized = [
    ...new Set(tagNames.map((tag) => tag.trim()).filter(Boolean)),
  ];

  if (normalized.length === 0) return [];

  const tags = await getTags();
  const existingSlugs = new Set(tags.map((tag) => tag.slug));
  let changed = false;

  for (const name of normalized) {
    const slug = slugify(name);
    if (!existingSlugs.has(slug)) {
      tags.push({
        id: crypto.randomUUID(),
        name,
        slug,
        createdAt: new Date().toISOString(),
      });
      existingSlugs.add(slug);
      changed = true;
    }
  }

  if (changed) {
    await writeJson(TAGS_FILE, tags);
  }

  return normalized;
}

export async function createTag(name: string): Promise<BlogTag> {
  const tags = await getTags();
  const trimmed = name.trim();
  const slug = slugify(trimmed);

  const existing = tags.find((tag) => tag.slug === slug);
  if (existing) return existing;

  const tag: BlogTag = {
    id: crypto.randomUUID(),
    name: trimmed,
    slug,
    createdAt: new Date().toISOString(),
  };

  tags.push(tag);
  await writeJson(TAGS_FILE, tags);
  return tag;
}

export async function deleteTag(id: string): Promise<boolean> {
  const tags = await getTags();
  const filtered = tags.filter((tag) => tag.id !== id);

  if (filtered.length === tags.length) return false;

  await writeJson(TAGS_FILE, filtered);
  return true;
}
