import Image from "next/image";
import Link from "next/link";
import type { Article } from "../data/articles";

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow group-hover:shadow-md">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px]">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
              {article.category}
            </span>
          </div>

          <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
            <div className="mb-3 flex items-center gap-1.5 text-sm text-muted">
              <ClockIcon />
              <span>{article.readTime}</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-navy transition-colors group-hover:text-navy/80 md:text-2xl lg:text-[1.65rem]">
              {article.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {article.excerpt}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
