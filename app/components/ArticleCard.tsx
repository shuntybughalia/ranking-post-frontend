import Image from "next/image";
import type { Article } from "../data/articles";

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-accent">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <ClockIcon />
            {article.readTime}
          </span>
        </div>

        <h3 className="text-base font-bold leading-snug text-navy md:text-lg">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {article.excerpt}
        </p>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
              {article.author.charAt(0)}
            </div>
            <span className="text-sm font-medium text-navy">{article.author}</span>
            <span className="text-muted">•</span>
            <span className="text-sm text-muted">{article.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
