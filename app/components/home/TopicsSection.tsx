import Link from "next/link";
import PostImage from "@/app/components/blog/PostImage";
import type { ArticleListItem } from "@/app/data/articles";

const TOPIC_LIMIT = 12;

interface Topic {
  name: string;
  count: number;
  /** Newest post in the topic, used for the card image. */
  latest: ArticleListItem;
}

/** Topics with published posts, largest first. Expects newest-first posts. */
function topicsFrom(articles: ArticleListItem[]): Topic[] {
  const topics = new Map<string, Topic>();

  for (const article of articles) {
    const topic = topics.get(article.category);
    if (topic) topic.count += 1;
    else topics.set(article.category, { name: article.category, count: 1, latest: article });
  }

  return [...topics.values()].sort((a, b) => b.count - a.count).slice(0, TOPIC_LIMIT);
}

/** Homepage grid of blog categories with live article counts. */
export default function TopicsSection({ articles }: { articles: ArticleListItem[] }) {
  const topics = topicsFrom(articles);
  if (topics.length === 0) return null;

  return (
    <section aria-labelledby="topics-heading" className="mx-auto w-full max-w-6xl px-6 pt-4 md:pt-8">
      <div className="mb-8 text-center">
        <h2 id="topics-heading" className="text-2xl font-bold text-navy md:text-4xl">
          Explore Articles by Topic
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-muted md:text-lg">
          Find guest posts in the subjects you care about.
        </p>
      </div>

      {/* Flex rather than grid so a part-filled last row stays centred. */}
      <ul className="flex flex-wrap justify-center gap-4">
        {topics.map((topic) => (
          <li
            key={topic.name}
            className="w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
          >
            <Link
              href={`/blog?category=${encodeURIComponent(topic.name)}`}
              className="group flex h-full overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-md"
            >
              <span className="relative block min-h-24 w-24 shrink-0 overflow-hidden bg-cream">
                <PostImage
                  src={topic.latest.image}
                  alt=""
                  sizes="96px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                <span className="font-bold leading-snug text-navy transition-colors group-hover:text-gold-dark">
                  {topic.name}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                  {topic.count} {topic.count === 1 ? "Article" : "Articles"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="inline-block rounded-lg bg-gold/20 px-5 py-2.5 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold hover:text-ink"
        >
          View All Articles
        </Link>
      </div>
    </section>
  );
}
