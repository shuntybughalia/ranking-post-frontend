import BlogSection from "@/app/components/home/BlogSection";
import { filterArticles, type ArticleListItem, type Category } from "@/app/data/articles";

const HOME_LATEST_LIMIT = 6;

interface HomeArticlesProps {
  articles: ArticleListItem[];
  activeCategory: Category;
}

/** Featured + latest posts for the homepage; renders on the server or client. */
export default function HomeArticles({ articles, activeCategory }: HomeArticlesProps) {
  const filtered = filterArticles(activeCategory, articles);
  const featured = filtered.find((article) => article.featured);
  const latest = filtered.filter((article) => !article.featured).slice(0, HOME_LATEST_LIMIT);

  return <BlogSection featured={featured} latest={latest} activeCategory={activeCategory} />;
}
