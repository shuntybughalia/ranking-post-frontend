export const articleCategories = [
  "SEO",
  "Health",
  "Business",
  "Technology",
  "Finance",
  "Lifestyle",
  "Digital Marketing",
  "Education",
  "Travel",
  "Real Estate",
  "Automotive",
  "Fashion",
  "Food",
  "Sports",
  "Entertainment",
  "Home Improvement",
  "Legal",
  "Parenting",
] as const;

export type ArticleCategory = (typeof articleCategories)[number];
export type CategoryFilter = "All Posts" | ArticleCategory;

export type PostStatus = "draft" | "pending" | "published" | "rejected";

/** A question and plain-text answer shown in a post's FAQ accordion. */
export interface FaqItem {
  question: string;
  answer: string;
}

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
  faqs: FaqItem[];
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
  publishedAt?: string | null;
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

/** Picks the male or female avatar icon; unset shows a neutral person. */
export type Gender = "male" | "female";

export const GENDERS: Gender[] = ["male", "female"];

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  gender?: Gender;
  /** Short plain-text bio; URLs in it are shown as links. */
  bio?: string;
  /** Uploaded profile photo; replaces the gender icon when set. */
  avatarUrl?: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender?: Gender;
  avatarUrl?: string;
}

/** A review outcome on one of the user's own posts, shown under the header bell. */
export interface PostNotification {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  rejectionReason?: string;
  at: string;
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
  faqs?: FaqItem[];
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
  faqs?: FaqItem[];
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
