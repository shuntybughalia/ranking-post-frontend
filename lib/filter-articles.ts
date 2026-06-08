import type { Article, Category } from "./types";

export function filterArticles(
  category: Category,
  list: Article[],
): Article[] {
  if (category === "All Posts") return list;
  return list.filter((article) => article.category === category);
}
