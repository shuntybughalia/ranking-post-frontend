import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PostImage from "@/app/components/blog/PostImage";
import { getArticlesByAuthorId } from "@/lib/articles";
import { getSession } from "@/lib/auth";
import BioText from "@/app/components/ui/BioText";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { getUserById } from "@/lib/users";
import type { Article, PostStatus, UserRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your Profile — RANKINGPOST",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const RECENT_LIMIT = 6;

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Author",
  admin: "Admin",
  super_admin: "Super Admin",
};

const STATUS_STYLES: Record<PostStatus, { label: string; badge: string; bar: string }> = {
  published: { label: "Published", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", bar: "bg-emerald-500" },
  pending: { label: "Pending review", badge: "bg-amber-50 text-amber-700 ring-amber-600/20", bar: "bg-amber-500" },
  draft: { label: "Draft", badge: "bg-slate-100 text-slate-700 ring-slate-500/20", bar: "bg-slate-400" },
  rejected: { label: "Rejected", badge: "bg-red-50 text-red-700 ring-red-600/20", bar: "bg-red-500" },
};

function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

function StatIcon({ path }: { path: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}>
      {style.label}
    </span>
  );
}

function RecentPostRow({ article }: { article: Article }) {
  const href = article.status === "published" ? `/blog/${article.slug}` : `/my-posts/${article.id}/edit`;
  return (
    <li className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:block">
        <PostImage src={article.image} alt="" sizes="80px" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={href} className="line-clamp-1 font-semibold text-ink hover:text-gold-dark">
          {article.title}
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{article.category}</span>
          <span>Updated {formatDate(article.updatedAt)}</span>
          <span>{article.views.toLocaleString()} views</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge status={article.status} />
        <Link href={`/my-posts/${article.id}/edit`} className="text-xs font-medium text-muted hover:text-gold-dark">
          Edit
        </Link>
      </div>
    </li>
  );
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/profile");

  const [user, articles] = await Promise.all([getUserById(session.id), getArticlesByAuthorId(session.id)]);
  const name = user?.name ?? session.name;
  const role = user?.role ?? session.role;

  const counts: Record<PostStatus, number> = { published: 0, pending: 0, draft: 0, rejected: 0 };
  for (const article of articles) counts[article.status] += 1;
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);

  const recent = [...articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, RECENT_LIMIT);
  const topPost = articles
    .filter((article) => article.status === "published")
    .sort((a, b) => b.views - a.views)[0];

  const stats = [
    { label: "Total posts", value: articles.length, icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6", tint: "bg-indigo-50 text-indigo-600" },
    { label: "Published", value: counts.published, icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3", tint: "bg-emerald-50 text-emerald-600" },
    { label: "Pending review", value: counts.pending, icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2", tint: "bg-amber-50 text-amber-600" },
    { label: "Total views", value: totalViews, icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", tint: "bg-sky-50 text-sky-600" },
  ];

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      <div className="h-36 bg-linear-to-r from-navy via-[#1f2937] to-gold-dark md:h-44" />

      <div className="mx-auto -mt-16 w-full max-w-6xl px-4 md:px-6">
        {/* Identity card */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <UserAvatar
                gender={user?.gender ?? session.gender}
                src={user?.avatarUrl}
                className="-mt-16 h-24 w-24 ring-4 ring-white sm:-mt-0 md:h-28 md:w-28"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-ink md:text-3xl">{name}</h1>
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-gold-dark">
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{session.email}</p>
                {user?.createdAt && (
                  <p className="mt-1 text-xs text-muted">Member since {formatDate(user.createdAt, { month: "long", year: "numeric" })}</p>
                )}
                {user?.bio ? (
                  <BioText bio={user.bio} className="mt-3 max-w-2xl text-sm leading-relaxed text-[#30384e]" />
                ) : (
                  <Link href="/settings" className="mt-3 inline-block text-sm text-muted hover:text-gold-dark">
                    + Add a short bio
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/settings" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50">
                Edit profile
              </Link>
              <Link href="/submit" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90">
                Write a post
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Post statistics" className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.tint}`}>
                <StatIcon path={stat.icon} />
              </span>
              <p className="mt-4 text-2xl font-bold text-ink md:text-3xl">{stat.value.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Recent posts */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Recent posts</h2>
              {articles.length > 0 && (
                <Link href="/my-posts" className="text-sm font-medium text-gold-dark hover:underline">
                  View all
                </Link>
              )}
            </div>
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                <p className="font-semibold text-ink">You haven&apos;t written anything yet</p>
                <p className="mt-1 text-sm text-muted">Your drafts and published posts will appear here.</p>
                <Link href="/submit" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90">
                  Write your first post
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((article) => (
                  <RecentPostRow key={article.id} article={article} />
                ))}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            {/* Status breakdown */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-ink">Post status</h2>
              <ul className="space-y-4">
                {(Object.keys(STATUS_STYLES) as PostStatus[]).map((status) => {
                  const share = articles.length ? (counts[status] / articles.length) * 100 : 0;
                  return (
                    <li key={status}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-muted">{STATUS_STYLES[status].label}</span>
                        <span className="font-semibold text-ink">{counts[status]}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${STATUS_STYLES[status].bar}`} style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Top post */}
            {topPost && (
              <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-ink">Most viewed post</h2>
                <Link href={`/blog/${topPost.slug}`} className="group block">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
                    <PostImage src={topPost.image} alt="" sizes="(max-width: 1023px) 100vw, 340px" />
                  </div>
                  <p className="mt-3 line-clamp-2 font-semibold text-ink group-hover:text-gold-dark">{topPost.title}</p>
                  <p className="mt-1 text-xs text-muted">{topPost.views.toLocaleString()} views</p>
                </Link>
              </section>
            )}

            {/* Shortcuts */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-ink">Shortcuts</h2>
              <ul className="divide-y divide-border text-sm">
                {[
                  { label: "Manage my posts", href: "/my-posts" },
                  { label: "Account settings", href: "/settings" },
                  { label: "Browse the blog", href: "/blog" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="flex items-center justify-between py-2.5 text-[#30384e] hover:text-gold-dark">
                      {link.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
