import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/app/components/blog/ArticleCard";
import ArticleContent from "@/app/components/blog/ArticleContent";
import BlogPostJsonLd from "@/app/components/blog/BlogPostJsonLd";
import CommentsSection from "@/app/components/blog/CommentsSection";
import FaqAccordion from "@/app/components/blog/FaqAccordion";
import ArticleViewTracker from "@/app/components/blog/ArticleViewTracker";
import PostImage from "@/app/components/blog/PostImage";
import PostSidebar from "@/app/components/blog/PostSidebar";
import { siteContainer } from "@/app/components/layout/siteContainer";
import SocialShare from "@/app/components/blog/SocialShare";
import {
  getAdjacentArticles,
  getArticleBySlug,
  getArticleListItems,
} from "@/lib/articles";
import { getPostUrl } from "@/lib/site-url";

// Cache each post for 60s (ISR); edits call revalidatePath for instant updates.
export const revalidate = 60;

// Render posts on first visit instead of at build time (keeps builds off the DB).
export function generateStaticParams() {
  return [];
}

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
    // Authors write their own meta title; don't append the site name to it.
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "RANKINGPOST",
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

function formatLongDate(article: { publishedAt: string | null; createdAt: string; date: string }) {
  const parsed = new Date(article.publishedAt ?? article.createdAt);
  if (Number.isNaN(parsed.getTime())) return article.date;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [articles, adjacent] = await Promise.all([
    getArticleListItems(),
    getAdjacentArticles(slug),
  ]);

  const related = articles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  const postUrl = getPostUrl(slug);

  return (
    <div className="flex-1 bg-white">
      <BlogPostJsonLd article={article} />
      <ArticleViewTracker articleId={article.id} />

      <div className={`${siteContainer} grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12`}>
        <article className="min-w-0">
          <h1 className="text-[32px] font-bold leading-[1.15] text-[#3a3a3a] md:text-[44px] lg:text-[52px]">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
            <span className="inline-flex items-center gap-2 font-semibold text-[#3a3a3a]">
              <span className="text-muted">
                <FolderIcon />
              </span>
              {article.author}
            </span>
            <span className="text-muted">{formatLongDate(article)}</span>
            <Link
              href={`/blog?category=${encodeURIComponent(article.category)}`}
              className="rounded-full bg-cream px-3 py-0.5 text-[13px] font-medium text-gold-dark transition-colors hover:bg-gold hover:text-ink"
            >
              {article.category}
            </Link>
            <span className="text-muted">{article.readTime}</span>
          </div>

          {/* Shown at the image's own shape; very tall images are capped and letterboxed, not cropped. */}
          <div className="mt-8 w-full overflow-hidden bg-[#e9e5dc]">
            <PostImage
              src={article.image}
              alt={article.title}
              sizes="(max-width: 1023px) 100vw, 800px"
              preload
              natural
              className="h-auto max-h-[75vh] w-full object-contain"
            />
          </div>

          <div className="mt-8">
            <ArticleContent content={article.content} />
          </div>

          <FaqAccordion faqs={article.faqs} />

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {article.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <div />
            )}
            <SocialShare url={postUrl} title={article.title} />
          </div>

          {(adjacent.previous || adjacent.next) && (
            <nav aria-label="More posts" className="mt-8 grid gap-4 sm:grid-cols-2">
              {adjacent.previous ? (
                <Link
                  href={`/blog/${adjacent.previous.slug}`}
                  className="rounded-md border border-border px-4 py-3 text-sm transition-colors hover:border-gold"
                >
                  <span className="text-muted">Previous</span>
                  <p className="font-medium text-ink">{adjacent.previous.title}</p>
                </Link>
              ) : (
                <div />
              )}
              {adjacent.next && (
                <Link
                  href={`/blog/${adjacent.next.slug}`}
                  className="rounded-md border border-border px-4 py-3 text-sm transition-colors hover:border-gold sm:text-right"
                >
                  <span className="text-muted">Next</span>
                  <p className="font-medium text-ink">{adjacent.next.title}</p>
                </Link>
              )}
            </nav>
          )}

          <CommentsSection articleId={article.id} slug={slug} />
        </article>

        <PostSidebar articles={articles} currentSlug={slug} />
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-cream py-12">
          <div className={siteContainer}>
            <h2 className="mb-6 text-xl font-bold text-ink">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
