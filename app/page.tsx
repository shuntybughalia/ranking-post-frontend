import Header from "./components/Header";
import Hero from "./components/Hero";
import BlogSection from "./components/BlogSection";
import NewsletterCTA from "./components/NewsletterCTA";
import { getArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getArticles();

  return (
    <>
      <Header />
      <Hero />
      <BlogSection articles={articles} />
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
