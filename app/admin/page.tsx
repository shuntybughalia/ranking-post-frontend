import Link from "next/link";
import { getArticles } from "@/lib/articles";
import DeleteArticleButton from "./DeleteArticleButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const articles = await getArticles();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Your Articles</h1>
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

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">No articles yet.</p>
          <Link
            href="/admin/new"
            className="mt-4 inline-block text-sm font-semibold text-navy hover:underline"
          >
            Write your first article
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-navy">Title</th>
                <th className="hidden px-6 py-4 font-semibold text-navy sm:table-cell">
                  Category
                </th>
                <th className="hidden px-6 py-4 font-semibold text-navy md:table-cell">
                  Author
                </th>
                <th className="px-6 py-4 font-semibold text-navy">Date</th>
                <th className="px-6 py-4 font-semibold text-navy">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="font-medium text-navy hover:underline"
                    >
                      {article.title}
                    </Link>
                    {article.featured && (
                      <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-navy">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 text-muted sm:table-cell">
                    {article.category}
                  </td>
                  <td className="hidden px-6 py-4 text-muted md:table-cell">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 text-muted">{article.date}</td>
                  <td className="px-6 py-4">
                    <DeleteArticleButton id={article.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
