import Header from "./components/Header";
import Hero from "./components/Hero";
import CategoryFilter from "./components/CategoryFilter";
import FeaturedArticle from "./components/FeaturedArticle";
import LatestArticles from "./components/LatestArticles";
import NewsletterCTA from "./components/NewsletterCTA";
import { articles } from "./data/articles";

export default function Home() {
  const featured = articles.find((a) => a.featured)!;
  const latest = articles.filter((a) => !a.featured);

  return (
    <>
      <Header />
      <Hero />
      <CategoryFilter />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <FeaturedArticle article={featured} />
        <LatestArticles articles={latest} />
        <NewsletterCTA />
      </main>
    </>
  );
}
