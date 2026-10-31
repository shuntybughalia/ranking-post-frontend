import type { ArticleListItem } from "@/app/data/articles";
import PostListCard from "@/app/components/home/PostListCard";
import Pagination from "@/app/components/ui/Pagination";

interface LatestArticlesProps {
  articles: ArticleListItem[];
  page: number;
  totalPages: number;
}

/** The hash keeps visitors at the post list instead of the top of the homepage. */
function pageHref(page: number) {
  return page === 1 ? "/#latest-posts" : `/?page=${page}#latest-posts`;
}

export default function LatestArticles({ articles, page, totalPages }: LatestArticlesProps) {
  return (
    <section id="latest-posts" className="scroll-mt-24">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-navy md:text-4xl">Latest Guest Posts</h2>
        <p className="mx-auto mt-2 max-w-2xl text-muted md:text-lg">
          Fresh articles from the writers, businesses and agencies publishing on RANKINGPOST.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {articles.map((article) => (
          <PostListCard key={article.id} article={article} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={pageHref}
        label="Latest guest posts pages"
      />
    </section>
  );
}
