import { Suspense } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomeBlogFeed from "./components/HomeBlogFeed";
import BlogSectionSkeleton from "./components/BlogSectionSkeleton";
import NewsletterCTA from "./components/NewsletterCTA";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Suspense fallback={<BlogSectionSkeleton />}>
        <HomeBlogFeed />
      </Suspense>
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
