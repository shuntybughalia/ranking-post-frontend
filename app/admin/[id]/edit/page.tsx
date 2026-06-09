import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/articles";
import ArticleForm from "../../components/ArticleForm";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/admin/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-navy"
      >
        ← Back to articles
      </Link>

      <h1 className="text-2xl font-bold text-navy">Edit Article</h1>
      <p className="mt-1 text-sm text-muted">
        Update &ldquo;{article.title}&rdquo;
      </p>

      <div className="mt-8">
        <ArticleForm mode="edit" article={article} />
      </div>
    </div>
  );
}
