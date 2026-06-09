"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { filterArticles, type Article, type Category } from "../data/articles";
import CategoryFilter from "../components/CategoryFilter";
import ArticleCard from "../components/ArticleCard";

interface BlogListingProps {
  articles: Article[];
}

export default function BlogListing({ articles }: BlogListingProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [activeCategory, setActiveCategory] = useState<Category>("All Posts");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    let result = filterArticles(activeCategory, articles);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeCategory, articles, searchQuery]);

  return (
    <>
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy md:text-3xl">All Blog Posts</h1>
          <p className="mt-2 text-muted">
            Expert insights on SEO, link building, and content marketing.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full max-w-md rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted">
            {searchQuery
              ? `No articles found for "${searchQuery}".`
              : "No articles found in this category."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
