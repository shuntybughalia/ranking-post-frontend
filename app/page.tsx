import HomeArticles from "@/app/components/home/HomeArticles";
import PublishCTA from "@/app/components/home/PublishCTA";
import TopicsSection from "@/app/components/home/TopicsSection";
import RecentPostsCarousel from "@/app/components/home/RecentPostsCarousel";
import NewsletterCTA from "@/app/components/home/NewsletterCTA";
import FaqAccordion from "@/app/components/blog/FaqAccordion";
import HomeReviews from "@/app/components/home/HomeReviews";
import { guestPostingFaqs } from "@/app/data/home-faqs";
import { guestPostingReviews } from "@/app/data/reviews";
import type { Metadata } from "next";
import { getArticleListItems } from "@/lib/articles";
import { firstParam, type SearchParams } from "@/lib/search-params";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = pageMetadata({
  title: "Guest Posting & SEO Services to Grow Traffic | RANKINGPOST",
  description:
    "Publish guest posts on RANKINGPOST and grow with on-page, off-page and AI SEO packages. Free to join, with SEO-friendly posts across many niches.",
  path: "/",
});

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${getSiteUrl()}/#organization`,
      name: "RANKINGPOST",
      url: getSiteUrl(),
      logo: `${getSiteUrl()}/logo.png`,
      email: "monietcriss@gmail.com",
    },
    {
      "@type": "WebSite",
      name: "RANKINGPOST",
      url: getSiteUrl(),
      publisher: { "@id": `${getSiteUrl()}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${getSiteUrl()}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: guestPostingFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

// Rendered per request from the in-memory article cache so it always matches the database.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [articles, params] = await Promise.all([getArticleListItems(), searchParams]);
  const requestedPage = Number.parseInt(firstParam(params.page) ?? "", 10);
  const page = requestedPage >= 1 ? requestedPage : 1;

  return (
    <>
      {/* Keeps a page-level heading for SEO now that the hero banner is gone. */}
      <h1 className="sr-only">Grow Your Traffic with Proven SEO Strategies</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <RecentPostsCarousel articles={articles.slice(0, 5)} />
      <HomeArticles articles={articles} page={page} />
      <PublishCTA articles={articles} />
      <TopicsSection articles={articles} />
      <div className="mx-auto w-full max-w-6xl px-6">
        <FaqAccordion
          faqs={guestPostingFaqs}
          title="Why RANKINGPOST Is the Best Place for Guest Posting"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <HomeReviews curatedReviews={guestPostingReviews} />
      </div>
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
