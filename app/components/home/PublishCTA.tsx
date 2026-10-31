import Link from "next/link";
import PostImage from "@/app/components/blog/PostImage";
import type { ArticleListItem } from "@/app/data/articles";

const CONTRIBUTOR_LIMIT = 5;

/** The newest post from each of the most recent authors. Expects newest-first posts. */
function recentContributors(articles: ArticleListItem[]) {
  const latestByAuthor = new Map<string, ArticleListItem>();

  for (const article of articles) {
    if (!latestByAuthor.has(article.author)) latestByAuthor.set(article.author, article);
    if (latestByAuthor.size === CONTRIBUTOR_LIMIT) break;
  }

  return [...latestByAuthor.values()];
}

/** Homepage call to action inviting visitors to publish, with real recent contributors. */
export default function PublishCTA({ articles }: { articles: ArticleListItem[] }) {
  const contributors = recentContributors(articles);

  return (
    <section
      aria-labelledby="publish-cta-heading"
      className="bg-linear-to-b from-[#f7eed9] to-background px-6 py-14 text-center md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <span className="inline-block rounded-full bg-gold/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-gold-dark sm:text-sm">
          Guest Posting Platform
        </span>

        <h2
          id="publish-cta-heading"
          className="mt-5 text-3xl font-bold leading-tight text-navy sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Post Your Article on{" "}
          <span className="bg-linear-to-r from-gold-dark to-[#b8860b] bg-clip-text text-transparent">
            RANKINGPOST
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#30384e] md:text-lg">
          Reach new readers with SEO-friendly articles. Writers, businesses and
          agencies use RANKINGPOST to share their expertise on the topics they
          know best.
        </p>

        <Link
          href="/submit"
          className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-gold bg-white px-8 py-3.5 font-semibold text-navy shadow-md transition-[background-color,box-shadow] hover:bg-gold hover:shadow-lg"
        >
          Publish Your Content
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        {contributors.length > 0 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-gold/30 pt-8 sm:flex-row sm:gap-6">
            <ul className="flex -space-x-2">
              {contributors.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/blog/${article.slug}`}
                    aria-label={`${article.author}: ${article.title}`}
                    title={article.author}
                    className="relative block h-14 w-14 overflow-hidden rounded-full border-[3px] border-white bg-cream shadow-sm transition-transform hover:z-10 hover:scale-110"
                  >
                    <PostImage src={article.image} alt="" sizes="56px" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="sm:text-left">
              <h3 className="text-lg font-bold text-navy">Meet Our Contributors</h3>
              <p className="text-sm text-muted">Tap a photo to read their latest post.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
