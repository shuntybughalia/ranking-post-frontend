export const articleCategories = [
  "SEO",
  "Health",
  "Business",
  "Technology",
  "Finance",
  "Lifestyle",
] as const;

export type ArticleCategory = (typeof articleCategories)[number];
export type CategoryFilter = "All Posts" | ArticleCategory;

export type PostStatus = "draft" | "pending" | "published" | "rejected";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: ArticleCategory;
  categoryId: string;
  readTime: string;
  author: string;
  authorId: string;
  date: string;
  image: string;
  featured?: boolean;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  views: number;
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  readTime: string;
  author: string;
  date: string;
  image: string;
  featured?: boolean;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export type UserRole = "user" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
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

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  categoryId: string;
  image: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  author: string;
  authorId: string;
  status: PostStatus;
  publishedAt?: string | null;
  featured?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  image?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status?: PostStatus;
  publishedAt?: string | null;
  featured?: boolean;
  rejectionReason?: string;
}

export interface PostStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  rejected: number;
  views: number;
}
