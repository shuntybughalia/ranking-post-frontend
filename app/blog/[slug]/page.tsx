import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import ArticleCard from "../../components/ArticleCard";
import ArticleContent from "../../components/ArticleContent";
import ArticleViewTracker from "../../components/ArticleViewTracker";
import BlogPostJsonLd from "../../components/BlogPostJsonLd";
import FeaturedImage from "../../components/FeaturedImage";
import SocialShare from "../../components/SocialShare";
import {
  getAdjacentArticles,
  getArticleBySlug,
  getArticlesForListing,
} from "@/lib/articles";
import { getPostUrl } from "@/lib/site-url";

export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Post Not Found" };

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const url = getPostUrl(slug);
  const image = article.image.startsWith("data:") ? undefined : article.image;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt ?? article.createdAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [articles, adjacent] = await Promise.all([
    getArticlesForListing(),
    getAdjacentArticles(slug),
  ]);

  const related = articles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  const postUrl = getPostUrl(slug);

  return (
    <>
      <ArticleViewTracker articleId={article.id} />
      <BlogPostJsonLd article={article} />
      <Header />

      <article>
        <div className="relative h-64 w-full md:h-80 lg:h-96">
          <FeaturedImage src={article.image} alt={article.title} priority />
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
              {article.category}
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-navy md:text-4xl">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
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
            <SocialShare url={postUrl} title={article.title} />
          </div>

          <ArticleContent content={article.content} />
        </div>
      </article>

      <section className="border-t border-border bg-white px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:justify-between">
          {adjacent.previous ? (
            <Link
              href={`/blog/${adjacent.previous.slug}`}
              className="rounded-xl border border-border px-4 py-3 text-sm hover:bg-slate-50"
            >
              <span className="text-muted">Previous</span>
              <p className="font-medium text-navy">{adjacent.previous.title}</p>
            </Link>
          ) : (
            <div />
          )}
          {adjacent.next ? (
            <Link
              href={`/blog/${adjacent.next.slug}`}
              className="rounded-xl border border-border px-4 py-3 text-sm hover:bg-slate-50 sm:text-right"
            >
              <span className="text-muted">Next</span>
              <p className="font-medium text-navy">{adjacent.next.title}</p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

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
