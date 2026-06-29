"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  filterArticles,
  parseCategoryFilter,
  type ArticleListItem,
} from "../data/articles";
import BlogSection from "./BlogSection";
import BlogSectionSkeleton from "./BlogSectionSkeleton";

const HOME_LATEST_LIMIT = 6;

export default function HomeBlogFeed() {
  const searchParams = useSearchParams();
  const activeCategory = parseCategoryFilter(searchParams.get("category"));
  const [articles, setArticles] = useState<ArticleListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/articles/listing", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load articles.");
        }
        return response.json();
      })
      .then((data: { articles?: ArticleListItem[] }) => {
        setArticles(Array.isArray(data.articles) ? data.articles : []);
      })
      .catch((fetchError) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }
        setError("Unable to load articles right now. Please refresh the page.");
      });

    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-16 text-center">
        <p className="text-muted">{error}</p>
      </main>
    );
  }

  if (!articles) {
    return <BlogSectionSkeleton />;
  }

  const filtered = filterArticles(activeCategory, articles);
  const featured = filtered.find((article) => article.featured);
  const latest = filtered
    .filter((article) => !article.featured)
    .slice(0, HOME_LATEST_LIMIT);

  return (
    <BlogSection
      featured={featured}
      latest={latest}
      activeCategory={activeCategory}
    />
  );
}
