"use client";

import { useState } from "react";
import {
  articles,
  filterArticles,
  type Category,
} from "../data/articles";
import CategoryFilter from "./CategoryFilter";
import FeaturedArticle from "./FeaturedArticle";
import LatestArticles from "./LatestArticles";

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState<Category>("All Posts");
  const filtered = filterArticles(activeCategory, articles);
  const featured = filtered.find((a) => a.featured);
  const latest = filtered.filter((a) => !a.featured);

  return (
    <>
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted">
            No articles found in this category.
          </p>
        ) : (
          <>
            {featured && <FeaturedArticle article={featured} />}
            {latest.length > 0 && (
              <LatestArticles articles={latest} showViewAll={false} />
            )}
          </>
        )}
      </main>
    </>
  );
}
