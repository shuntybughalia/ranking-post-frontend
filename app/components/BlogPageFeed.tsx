"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  parseCategoryFilter,
  type ArticleListItem,
} from "../data/articles";
import BlogListing from "../blog/BlogListing";
import BlogListingSkeleton from "../blog/BlogListingSkeleton";

export default function BlogPageFeed() {
  const searchParams = useSearchParams();
  const activeCategory = parseCategoryFilter(searchParams.get("category"));
  const searchQuery = searchParams.get("q") ?? "";
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
    return <BlogListingSkeleton />;
  }

  return (
    <BlogListing
      articles={articles}
      activeCategory={activeCategory}
      searchQuery={searchQuery}
    />
  );
}
