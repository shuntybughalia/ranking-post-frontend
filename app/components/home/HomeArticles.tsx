import BlogSection from "@/app/components/home/BlogSection";
import type { ArticleListItem } from "@/app/data/articles";

const HOME_LATEST_LIMIT = 6;

/** Latest posts grid for the homepage; renders on the server or client. */
export default function HomeArticles({ articles }: { articles: ArticleListItem[] }) {
  return <BlogSection latest={articles.slice(0, HOME_LATEST_LIMIT)} />;
}
