import HomeArticles from "@/app/components/home/HomeArticles";
import RecentPostsCarousel from "@/app/components/home/RecentPostsCarousel";
import NewsletterCTA from "@/app/components/home/NewsletterCTA";
import FaqAccordion from "@/app/components/blog/FaqAccordion";
import HomeReviews from "@/app/components/home/HomeReviews";
import { guestPostingFaqs } from "@/app/data/home-faqs";
import { guestPostingReviews } from "@/app/data/reviews";
import type { Metadata } from "next";
import { getArticleListItems } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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

export default async function Home() {
  const articles = await getArticleListItems();

  return (
    <>
      {/* Keeps a page-level heading for SEO now that the hero banner is gone. */}
      <h1 className="sr-only">Grow Your Traffic with Proven SEO Strategies</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <RecentPostsCarousel articles={articles.slice(0, 5)} />
      <HomeArticles articles={articles} />
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
