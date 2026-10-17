import Hero from "@/app/components/home/Hero";
import HomeArticles from "@/app/components/home/HomeArticles";
import NewsletterCTA from "@/app/components/home/NewsletterCTA";
import { parseCategoryFilter } from "@/app/data/articles";
import { getArticleListItems } from "@/lib/articles";
import { firstParam, type SearchParams } from "@/lib/search-params";

// Rendered per request from the in-memory article cache so it always matches the database.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [articles, params] = await Promise.all([getArticleListItems(), searchParams]);

  return (
    <>
      <Hero />
      <HomeArticles
        articles={articles}
        activeCategory={parseCategoryFilter(firstParam(params.category))}
      />
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
