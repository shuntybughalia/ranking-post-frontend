import Header from "./components/Header";
import Hero from "./components/Hero";
import BlogSection from "./components/BlogSection";
import BlogSectionSkeleton from "./components/BlogSectionSkeleton";
import NewsletterCTA from "./components/NewsletterCTA";
import { getArticlesForListing } from "@/lib/articles";
import {
  filterArticles,
  parseCategoryFilter,
} from "@/lib/filter-articles";
import { Suspense } from "react";

export const revalidate = 60;

const HOME_LATEST_LIMIT = 6;

interface HomeBlogSectionProps {
  category?: string;
}

async function HomeBlogSection({ category }: HomeBlogSectionProps) {
  const activeCategory = parseCategoryFilter(category);
  const articles = await getArticlesForListing();
  const filtered = filterArticles(activeCategory, articles);
  const featured = filtered.find((article) => article.featured);
  const latest = filtered.filter((article) => !article.featured).slice(0, HOME_LATEST_LIMIT);

  return (
    <BlogSection
      featured={featured}
      latest={latest}
      activeCategory={activeCategory}
    />
  );
}

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams;

  return (
    <>
      <Header />
      <Hero />
      <Suspense fallback={<BlogSectionSkeleton />}>
        <HomeBlogSection category={category} />
      </Suspense>
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
