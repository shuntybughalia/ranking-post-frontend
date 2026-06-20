import type { Article, CategoryFilter } from "./types";

export function filterArticles(
  category: CategoryFilter,
  list: Article[],
): Article[] {
  if (category === "All Posts") return list;
  return list.filter((article) => article.category === category);
}
