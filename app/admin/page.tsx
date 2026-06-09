import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { getPlatformStats } from "@/lib/stats";
import StatsCard from "./components/StatsCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, session] = await Promise.all([
    getPlatformStats(),
    getSession(),
  ]);
  const superAdmin = session ? isSuperAdmin(session.role) : false;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of your RANKINGPOST platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Articles" value={stats.totalArticles} />
        <StatsCard label="Featured" value={stats.featuredArticles} />
        <StatsCard label="Users" value={stats.totalUsers} />
        <StatsCard
          label="Newsletter Subscribers"
          value={stats.totalSubscribers}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Recent Articles</h2>
            <Link
              href="/admin/articles"
              className="text-sm font-medium text-navy hover:underline"
            >
              View all
            </Link>
          </div>
          {stats.recentArticles.length === 0 ? (
            <p className="text-sm text-muted">No articles yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentArticles.map((article, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-navy">
                    {article.title}
                  </span>
                  <span className="text-xs text-muted">{article.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-navy">
            Articles by Category
          </h2>
          <ul className="space-y-3">
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <li key={category} className="flex items-center justify-between">
                <span className="text-sm text-muted">{category}</span>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-sm font-medium text-navy">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/new"
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          + New Article
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-navy hover:bg-slate-50"
        >
          View Orders
        </Link>
        <Link
          href="/admin/newsletter"
          className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-navy hover:bg-slate-50"
        >
          Newsletter Subscribers
        </Link>
        {superAdmin && (
          <Link
            href="/admin/users"
            className="rounded-lg border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-medium text-purple-800 hover:bg-purple-100"
          >
            Manage All Users
          </Link>
        )}
      </div>
    </div>
  );
}
