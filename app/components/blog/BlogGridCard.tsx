import Link from "next/link";
import PostImage from "@/app/components/blog/PostImage";
import type { ArticleListItem } from "@/app/data/articles";

const TITLE_LIMIT = 45;
const EXCERPT_LIMIT = 170;

function truncate(text: string, limit: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function formatPostDate(article: ArticleListItem) {
  const source = article.publishedAt ?? article.updatedAt;
  const parsed = source ? new Date(source) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return article.date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AngleRightIcon() {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 256 512"
      fill="currentColor"
      aria-hidden="true"
      className="inline-block align-[-2px]"
    >
      <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" />
    </svg>
  );
}

export default function BlogGridCard({ article }: { article: ArticleListItem }) {
  const href = `/blog/${article.slug}`;

  return (
    <div className="mb-[30px] flex h-[calc(100%-30px)] flex-col rounded-[6px] bg-white">
      <div className="relative h-[200px] overflow-hidden rounded-t-[6px] bg-[#c5c8cf]">
        <div className="absolute left-[11.2px] top-[11.2px] z-10">
          <div className="relative rounded-l-[4px] bg-gold px-3 py-1 text-[11px] font-medium uppercase leading-[16.5px] tracking-[0.5px] text-ink before:absolute before:left-[calc(100%-1.6px)] before:top-0 before:border-r-[13.6px] before:border-t-[13.6px] before:border-r-transparent before:border-t-gold before:content-[''] after:absolute after:bottom-0 after:left-[calc(100%-1.6px)] after:border-b-[13.6px] after:border-r-[13.6px] after:border-b-gold after:border-r-transparent after:content-['']">
            {article.category}
          </div>
        </div>
        <Link href={href} className="relative block h-full w-full" aria-label={article.title}>
          <PostImage
            src={article.image}
            alt={article.title}
            sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col rounded-b-[6px] border-[0.8px] border-[#d8d8d8]">
        <div className="flex-1 px-4 py-2">
          <h4 className="mb-0 text-[12.6px] font-semibold leading-[26px] text-[#30384e]" title={article.title}>
            <Link
              href={href}
              className="text-[16px] capitalize text-[#172228] transition-colors hover:text-gold-dark"
            >
              {truncate(article.title, TITLE_LIMIT)}
            </Link>
          </h4>
          <div className="text-[12.25px] font-bold leading-[18.375px] text-[#333]">
            {formatPostDate(article)}
          </div>
          <div className="mt-4">
            <p className="mb-[10px] text-[14px] leading-[21px] text-[#2a2a2b]">
              {truncate(article.excerpt, EXCERPT_LIMIT)}
            </p>
          </div>
        </div>

        <div className="border-t-[0.8px] border-dashed border-[#eee] p-2">
          <Link
            href={href}
            className="px-[10px] text-[16px] font-medium leading-[24.48px] text-gold-dark hover:text-gold"
          >
            View Details <AngleRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
