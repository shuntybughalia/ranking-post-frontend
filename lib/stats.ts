import "server-only";
import { getAllArticles } from "./articles";
import { getSubscribers } from "./newsletter";
import { getUsers } from "./users";
import { articleCategories } from "./types";

export interface PlatformStats {
  totalArticles: number;
  featuredArticles: number;
  totalUsers: number;
  totalSubscribers: number;
  categoryCounts: Record<string, number>;
  recentArticles: { title: string; date: string; category: string }[];
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [articles, users, subscribers] = await Promise.all([
    getAllArticles(),
    getUsers(),
    getSubscribers(),
  ]);

  const categoryCounts: Record<string, number> = {};
  for (const cat of articleCategories) {
    categoryCounts[cat] = articles.filter((a) => a.category === cat).length;
  }

  return {
    totalArticles: articles.length,
    featuredArticles: articles.filter((a) => a.featured).length,
    totalUsers: users.length,
    totalSubscribers: subscribers.length,
    categoryCounts,
    recentArticles: articles.slice(0, 5).map((a) => ({
      title: a.title,
      date: a.date,
      category: a.category,
    })),
  };
}
