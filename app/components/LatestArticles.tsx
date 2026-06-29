import Link from "next/link";
import type { ArticleListItem } from "../data/articles";
import ArticleCard from "./ArticleCard";

interface LatestArticlesProps {
  articles: ArticleListItem[];
  showViewAll?: boolean;
}

export default function LatestArticles({
  articles,
  showViewAll = true,
}: LatestArticlesProps) {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy md:text-2xl">Latest Articles</h2>
        {showViewAll && (
          <Link
            href="/blog"
            className="text-sm font-medium text-muted transition-colors hover:text-navy"
          >
            View all
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
