"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MyPostsDashboard from "./MyPostsDashboard";
import { ApiError, apiFetch } from "@/lib/api-client";
import type { Article, PostStats } from "@/lib/types";

interface MyPostsPageClientProps {
  articles: Article[];
  stats: PostStats;
}

export default function MyPostsPageClient({ articles, stats }: MyPostsPageClientProps) {
  const router = useRouter();

  // Bounce to login if the session expired while the page was cached.
  useEffect(() => {
    apiFetch("/api/auth/me", { toastOnError: false }).catch((error) => {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login?redirect=/my-posts");
      }
    });
  }, [router]);

  return <MyPostsDashboard initialArticles={articles} initialStats={stats} />;
}
