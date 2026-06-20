"use client";

import { FormEvent, useEffect, useState } from "react";
import type { BlogCategory, BlogTag } from "@/lib/types";
import { useToast } from "@/app/components/Toast";

export default function CategoriesManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [categoriesRes, tagsRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/tags"),
    ]);
    const categoriesData = await categoriesRes.json();
    const tagsData = await tagsRes.json();
    setCategories(categoriesData.categories ?? []);
    setTags(tagsData.tags ?? []);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to create category.", "error");
        return;
      }
      setCategoryName("");
      showToast("Category created.", "success");
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTag(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to create tag.", "error");
        return;
      }
      setTagName("");
      showToast("Tag created.", "success");
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error ?? "Failed to delete category.", "error");
      return;
    }
    showToast("Category deleted.", "success");
    await loadData();
  }

  async function handleDeleteTag(id: string) {
    const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error ?? "Failed to delete tag.", "error");
      return;
    }
    showToast("Tag deleted.", "success");
    await loadData();
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
                onClick={() => void handleDeleteCategory(category.id)}
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
                onClick={() => void handleDeleteTag(tag.id)}
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
