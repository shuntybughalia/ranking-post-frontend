import Header from "./components/Header";
import Hero from "./components/Hero";
import BlogSection from "./components/BlogSection";
import BlogSectionSkeleton from "./components/BlogSectionSkeleton";
import NewsletterCTA from "./components/NewsletterCTA";
import { getArticlesForListing } from "@/lib/articles";
import { Suspense } from "react";

export const revalidate = 60;

async function HomeBlogSection() {
  const articles = await getArticlesForListing();
  return <BlogSection articles={articles} />;
}

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Suspense fallback={<BlogSectionSkeleton />}>
        <HomeBlogSection />
      </Suspense>
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
