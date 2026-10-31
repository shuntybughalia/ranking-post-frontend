import BlogSection from "@/app/components/home/BlogSection";
import type { ArticleListItem } from "@/app/data/articles";

const POSTS_PER_PAGE = 10;

interface HomeArticlesProps {
  articles: ArticleListItem[];
  /** Requested page; anything past the end shows the last page. */
  page: number;
}

/** One page of the latest posts for the homepage. */
export default function HomeArticles({ articles, page }: HomeArticlesProps) {
  const totalPages = Math.max(1, Math.ceil(articles.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;

  return (
    <BlogSection
      latest={articles.slice(start, start + POSTS_PER_PAGE)}
      page={currentPage}
      totalPages={totalPages}
    />
  );
}
