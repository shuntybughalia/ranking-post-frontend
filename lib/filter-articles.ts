import {
  articleCategories,
  type ArticleListItem,
  type CategoryFilter,
} from "./types";

export function parseCategoryFilter(value?: string | null): CategoryFilter {
  if (!value) return "All Posts";

  return articleCategories.includes(value as (typeof articleCategories)[number])
    ? (value as CategoryFilter)
    : "All Posts";
}

export function filterArticles(
  category: CategoryFilter,
  list: ArticleListItem[],
): ArticleListItem[] {
  if (category === "All Posts") return list;
  return list.filter((article) => article.category === category);
}

export function filterArticlesByQuery(
  list: ArticleListItem[],
  query: string,
): ArticleListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;

  return list.filter(
    (article) =>
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q) ||
      article.author.toLowerCase().includes(q),
  );
}
