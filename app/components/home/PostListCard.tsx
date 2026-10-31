import Link from "next/link";
import PostImage from "@/app/components/blog/PostImage";
import type { ArticleListItem } from "@/app/data/articles";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}

/** "5 days ago" for recent posts; the post's date once it's over a month old. */
function formatTimeAgo(article: ArticleListItem) {
  const published = new Date(article.publishedAt ?? article.updatedAt).getTime();
  if (Number.isNaN(published)) return article.date;

  const elapsed = Date.now() - published;
  if (elapsed < HOUR) return "Just now";
  if (elapsed < DAY) return plural(Math.floor(elapsed / HOUR), "hour");
  if (elapsed < 30 * DAY) return plural(Math.floor(elapsed / DAY), "day");
  return article.date;
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-gold">
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Compact homepage post card: small featured image beside the post details. */
export default function PostListCard({ article }: { article: ArticleListItem }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group flex">
      <article className="flex w-full gap-4 rounded-2xl bg-white p-4 shadow-sm transition-shadow group-hover:shadow-md sm:gap-5 sm:p-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-28 sm:w-28 lg:h-auto lg:min-h-36 lg:w-44 lg:self-stretch">
          <PostImage
            src={article.image}
            alt={article.title}
            sizes="(min-width: 1024px) 176px, (min-width: 640px) 112px, 96px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted">
            <TagIcon />
            <span className="truncate">{article.category}</span>
          </span>

          <h3 className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug text-navy transition-colors group-hover:text-gold-dark sm:text-base lg:text-lg">
            {article.title}
          </h3>

          <div className="mt-auto flex min-w-0 max-w-full flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-muted sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon />
              {formatTimeAgo(article)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <UserIcon />
              <span className="truncate font-medium text-gold-dark">{article.author}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
