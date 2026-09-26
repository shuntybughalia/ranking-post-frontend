import { Suspense } from "react";
import type { ArticleListItem, Category } from "../data/articles";
import CategoryFilter from "./CategoryFilter";
import FeaturedArticle from "./FeaturedArticle";
import LatestArticles from "./LatestArticles";

interface BlogSectionProps {
  featured?: ArticleListItem;
  latest: ArticleListItem[];
  activeCategory: Category;
}

export default function BlogSection({
  featured,
  latest,
  activeCategory,
}: BlogSectionProps) {
  const hasArticles = Boolean(featured) || latest.length > 0;

  return (
    <>
      <Suspense
        fallback={
          <section className="border-b border-border bg-slate-50 px-6 py-5">
            <div className="mx-auto h-9 max-w-6xl animate-pulse rounded-full bg-slate-200" />
          </section>
        }
      >
        <CategoryFilter active={activeCategory} />
      </Suspense>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {!hasArticles ? (
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
