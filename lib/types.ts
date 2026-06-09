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

export interface MarketPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  da: number;
  traffic: string;
  niche: string;
  turnaround: string;
}

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  price: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}
