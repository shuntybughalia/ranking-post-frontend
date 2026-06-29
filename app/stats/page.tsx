import type { Metadata } from "next";
import Header from "../components/Header";
import { getPlatformStats } from "@/lib/stats";
import { articleCategories } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Stats — RANKINGPOST",
  description: "Platform statistics and content analytics for RANKINGPOST.",
};

export default async function StatsPage() {
  const stats = await getPlatformStats();
  const maxCategory = Math.max(...Object.values(stats.categoryCounts), 1);

  return (
    <>
      <Header />
      <section className="bg-navy px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          Platform Stats
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Real-time insights into our content library and community growth.
        </p>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Published Articles", value: stats.totalArticles },
            { label: "Featured Posts", value: stats.featuredArticles },
            { label: "Registered Users", value: stats.totalUsers },
            { label: "Newsletter Subscribers", value: stats.totalSubscribers },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-navy">{item.value}</p>
              <p className="mt-1 text-sm text-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-lg font-semibold text-navy">
            Content by Category
          </h2>
          <div className="space-y-4">
            {articleCategories.map((category) => {
              const count = stats.categoryCounts[category] ?? 0;
              const width = `${(count / maxCategory) * 100}%`;
              return (
                <div key={category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-navy">{category}</span>
                    <span className="text-muted">{count} articles</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {stats.recentArticles.length > 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-lg font-semibold text-navy">
              Latest Publications
            </h2>
            <ul className="divide-y divide-border">
              {stats.recentArticles.map((article, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-navy">{article.title}</p>
                    <p className="text-xs text-muted">{article.category}</p>
                  </div>
                  <span className="text-sm text-muted">{article.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
