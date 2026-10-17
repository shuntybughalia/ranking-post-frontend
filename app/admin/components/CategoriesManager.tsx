"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { showToast } from "@/lib/toast";
import type { BlogCategory, BlogTag } from "@/lib/types";

async function fetchTaxonomy() {
  const [categoriesData, tagsData] = await Promise.all([
    apiFetch<{ categories?: BlogCategory[] }>("/api/categories"),
    apiFetch<{ tags?: BlogTag[] }>("/api/tags"),
  ]);
  return { categories: categoriesData.categories ?? [], tags: tagsData.tags ?? [] };
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(false);

  function applyTaxonomy(data: { categories: BlogCategory[]; tags: BlogTag[] }) {
    setCategories(data.categories);
    setTags(data.tags);
  }

  async function loadData() {
    try {
      applyTaxonomy(await fetchTaxonomy());
    } catch {
      // apiFetch already showed the error toast.
    }
  }

  useEffect(() => {
    fetchTaxonomy()
      .then(applyTaxonomy)
      .catch(() => {
        // apiFetch already showed the error toast.
      });
  }, []);

  async function mutate(request: () => Promise<unknown>, successMessage: string) {
    setLoading(true);
    try {
      await request();
      showToast(successMessage, "success");
      await loadData();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    const created = await mutate(
      () => apiFetch("/api/categories", { method: "POST", json: { name: categoryName } }),
      "Category created.",
    );
    if (created) setCategoryName("");
  }

  async function handleCreateTag(e: FormEvent) {
    e.preventDefault();
    const created = await mutate(
      () => apiFetch("/api/tags", { method: "POST", json: { name: tagName } }),
      "Tag created.",
    );
    if (created) setTagName("");
  }

  function handleDeleteCategory(id: string) {
    void mutate(
      () => apiFetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
      "Category deleted.",
    );
  }

  function handleDeleteTag(id: string) {
    void mutate(
      () => apiFetch(`/api/tags?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
      "Tag deleted.",
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy">Categories</h2>
        <form onSubmit={handleCreateCategory} className="mt-4 flex gap-3">
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            Add
          </button>
        </form>
        <ul className="mt-6 space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <span className="text-sm font-medium text-navy">{category.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(category.id)}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy">Tags</h2>
        <form onSubmit={handleCreateTag} className="mt-4 flex gap-3">
          <input
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="New tag name"
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            Add
          </button>
        </form>
        <ul className="mt-6 space-y-3">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <span className="text-sm font-medium text-navy">#{tag.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteTag(tag.id)}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
