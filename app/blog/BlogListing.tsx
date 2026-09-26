import { Suspense } from "react";
import {
  filterArticles,
  filterArticlesByQuery,
  type ArticleListItem,
  type Category,
} from "../data/articles";
import ArticleCard from "../components/ArticleCard";
import BlogSearch from "../components/BlogSearch";
import CategoryFilter from "../components/CategoryFilter";

interface BlogListingProps {
  articles: ArticleListItem[];
  activeCategory: Category;
  searchQuery: string;
}

export default function BlogListing({
  articles,
  activeCategory,
  searchQuery,
}: BlogListingProps) {
  const filtered = filterArticlesByQuery(
    filterArticles(activeCategory, articles),
    searchQuery,
  );

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy md:text-3xl">All Blog Posts</h1>
          <p className="mt-2 text-muted">
            Expert insights on SEO, link building, and content marketing.
          </p>
        </div>

        <Suspense fallback={<div className="mb-6 h-11 w-full max-w-md animate-pulse rounded-lg bg-slate-200" />}>
          <BlogSearch defaultQuery={searchQuery} />
        </Suspense>

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
