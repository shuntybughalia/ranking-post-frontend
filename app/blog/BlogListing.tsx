"use client";

import { useState } from "react";
import { filterArticles, type Article, type Category } from "../data/articles";
import CategoryFilter from "../components/CategoryFilter";
import ArticleCard from "../components/ArticleCard";

interface BlogListingProps {
  articles: Article[];
}

export default function BlogListing({ articles }: BlogListingProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All Posts");
  const filtered = filterArticles(activeCategory, articles);

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

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted">
            No articles found in this category.
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
