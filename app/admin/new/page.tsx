import Link from "next/link";
import ArticleForm from "../components/ArticleForm";

export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/admin/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-navy"
      >
        ← Back to articles
      </Link>

      <h1 className="text-2xl font-bold text-navy">Publish New Article</h1>
      <p className="mt-1 text-sm text-muted">
        Your article will appear on the homepage and blog immediately.
      </p>

      <div className="mt-8">
        <ArticleForm mode="create" />
      </div>
    </div>
  );
}
