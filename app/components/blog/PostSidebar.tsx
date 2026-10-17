import Link from "next/link";
import PostImage from "@/app/components/blog/PostImage";
import { categories, type ArticleListItem } from "@/app/data/articles";

const RECENT_LIMIT = 5;

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SidebarBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-md border border-[#ececec] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="bg-[#f6f4ef] px-6 py-4 text-[22px] font-medium text-[#3a3a3a]">{title}</h2>
      {children}
    </section>
  );
}

interface PostSidebarProps {
  articles: ArticleListItem[];
  currentSlug: string;
}

/** Categories and recent posts, shown beside a blog post. */
export default function PostSidebar({ articles, currentSlug }: PostSidebarProps) {
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
  }
  const recent = articles.filter((article) => article.slug !== currentSlug).slice(0, RECENT_LIMIT);

  return (
    <aside className="space-y-8 lg:sticky lg:top-24">
      <SidebarBox title="Categories">
        <ul className="px-6">
          {categories
            .filter((category) => counts.has(category))
            .map((category) => (
              <li key={category} className="border-b border-[#ececec] last:border-b-0">
                <Link
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between py-4 text-[17px] text-[#3a3a3a] transition-colors hover:text-gold-dark"
                >
                  <span>
                    {category}
                    <span className="ml-2 text-[14px] text-muted">({counts.get(category)})</span>
                  </span>
                  <ChevronRight />
                </Link>
              </li>
            ))}
        </ul>
      </SidebarBox>

      {recent.length > 0 && (
        <SidebarBox title="Recent posts">
          <ul>
            {recent.map((article) => (
              <li key={article.id} className="border-b border-[#ececec] last:border-b-0">
                <Link href={`/blog/${article.slug}`} className="group flex gap-3 p-3">
                  <div className="relative h-[72px] w-[110px] shrink-0 overflow-hidden rounded bg-[#e9e5dc]">
                    <PostImage src={article.image} alt={article.title} sizes="110px" />
                  </div>
                  <span className="line-clamp-3 text-[15px] font-semibold leading-snug text-[#3a3a3a] transition-colors group-hover:text-gold-dark">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SidebarBox>
      )}
    </aside>
  );
}
