import Link from "next/link";
import { getArticles } from "@/lib/articles";
import ArticleSearch from "../components/ArticleSearch";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Articles</h1>
          <p className="mt-1 text-sm text-muted">
            Manage and publish blog posts on RANKINGPOST.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          + New Article
        </Link>
      </div>

      <ArticleSearch articles={articles} />
    </div>
  );
}
