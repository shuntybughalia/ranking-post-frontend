export const articleCategories = [
  "SEO",
  "Health",
  "Business",
  "Technology",
  "Finance",
  "Lifestyle",
] as const;

export type ArticleCategory = (typeof articleCategories)[number];
export type Category = "All Posts" | ArticleCategory;

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: ArticleCategory;
  readTime: string;
  author: string;
  date: string;
  image: string;
  featured?: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}
