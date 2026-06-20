"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import MyPostsDashboard from "./MyPostsDashboard";
import { ToastProvider } from "@/app/components/Toast";
import type { Article, PostStats } from "@/lib/types";

interface MyPostsPageClientProps {
  articles: Article[];
  stats: PostStats;
}

function MyPostsContent({
  articles,
  stats,
}: MyPostsPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login?redirect=/my-posts");
        }
      })
      .catch(() => router.push("/login?redirect=/my-posts"));
  }, [router]);

  return (
    <>
      <Header />
      <MyPostsDashboard initialArticles={articles} initialStats={stats} />
    </>
  );
}

export default function MyPostsPageClient(props: MyPostsPageClientProps) {
  return (
    <ToastProvider>
      <MyPostsContent {...props} />
    </ToastProvider>
  );
}
