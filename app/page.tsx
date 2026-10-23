import HomeArticles from "@/app/components/home/HomeArticles";
import RecentPostsCarousel from "@/app/components/home/RecentPostsCarousel";
import NewsletterCTA from "@/app/components/home/NewsletterCTA";
import { getArticleListItems } from "@/lib/articles";

// Rendered per request from the in-memory article cache so it always matches the database.
export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getArticleListItems();

  return (
    <>
      {/* Keeps a page-level heading for SEO now that the hero banner is gone. */}
      <h1 className="sr-only">Grow Your Traffic with Proven SEO Strategies</h1>
      <RecentPostsCarousel articles={articles.slice(0, 5)} />
      <HomeArticles articles={articles} />
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
