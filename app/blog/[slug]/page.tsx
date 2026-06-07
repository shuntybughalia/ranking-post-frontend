import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import ArticleCard from "../../components/ArticleCard";
import { articles, getAllSlugs, getArticleBySlug } from "../../data/articles";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) return { title: "Post Not Found" };

  return {
    title: `${article.title} — RANKINGPOST`,
    description: article.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const related = articles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  return (
    <>
      <Header />

      <article>
        <div className="relative h-64 w-full md:h-80 lg:h-96">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-navy/50" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-10">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-navy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Blog
          </Link>

          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
            {article.category}
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-navy md:text-4xl">
            {article.title}
          </h1>

          <div className="mt-6 flex items-center gap-3 border-b border-border pb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-navy">{article.author}</p>
              <p className="text-sm text-muted">
                {article.date} · {article.readTime}
              </p>
            </div>
          </div>

          <div className="prose prose-slate mt-8 max-w-none">
            {article.content.map((paragraph, index) => (
              <p
                key={index}
                className="mb-5 text-base leading-relaxed text-muted last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-slate-50 px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-xl font-bold text-navy">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
