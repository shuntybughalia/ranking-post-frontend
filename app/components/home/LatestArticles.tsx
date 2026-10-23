import type { ArticleListItem } from "@/app/data/articles";
import ArticleCard from "@/app/components/blog/ArticleCard";

export default function LatestArticles({ articles }: { articles: ArticleListItem[] }) {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-bold text-navy md:text-2xl">More Articles</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
