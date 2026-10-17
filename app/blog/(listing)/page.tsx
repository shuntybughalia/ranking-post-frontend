import type { Metadata } from "next";
import Link from "next/link";
import BlogListing, { blogContainer } from "@/app/components/blog/BlogListing";
import { parseCategoryFilter } from "@/app/data/articles";
import { getArticleListItems } from "@/lib/articles";
import { firstParam, type SearchParams } from "@/lib/search-params";

// Rendered per request from the in-memory article cache, so the listing always
// matches the database (build-time data comes from a stale JSON fallback).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — RANKINGPOST",
  description:
    "Expert SEO insights, link building strategies, and content marketing guides.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [articles, params] = await Promise.all([getArticleListItems(), searchParams]);

  return (
    <div className="flex-1 bg-white text-[14px] leading-[21px] text-[#333]">
      <h1 className="sr-only">Blog</h1>
      <div className="border-b-[0.8px] border-[#e9e9e9] bg-white py-4">
        <nav aria-label="Breadcrumb" className={blogContainer}>
          <ol className="flex flex-wrap items-center text-[14px] leading-[21px]">
            <li>
              <Link href="/" className="text-[#333] hover:text-gold-dark">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="px-2 text-[#6c757d]">/</span>
              <Link href="/blog" className="text-gold-dark" aria-current="page">
                Blog
              </Link>
            </li>
          </ol>
        </nav>
      </div>
      <BlogListing
        articles={articles}
        activeCategory={parseCategoryFilter(firstParam(params.category))}
        searchQuery={firstParam(params.q)?.trim() ?? ""}
        showAllRecent={firstParam(params.view) === "all"}
      />
    </div>
  );
}
