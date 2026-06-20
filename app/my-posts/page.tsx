import { redirect } from "next/navigation";
import { getArticlesByAuthorId, getPostStats } from "@/lib/articles";
import { getSession } from "@/lib/auth";
import MyPostsPageClient from "./MyPostsPageClient";

export const dynamic = "force-dynamic";

export default async function MyPostsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/my-posts");
  }

  const [articles, stats] = await Promise.all([
    getArticlesByAuthorId(session.id),
    getPostStats(session.id),
  ]);

  return <MyPostsPageClient articles={articles} stats={stats} />;
}
