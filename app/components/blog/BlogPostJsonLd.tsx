import type { Article } from "@/lib/types";
import { getPostUrl, getSiteUrl } from "@/lib/site-url";

interface BlogPostJsonLdProps {
  article: Article;
}

export default function BlogPostJsonLd({ article }: BlogPostJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    image: article.image.startsWith("data:") ? undefined : article.image,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "RANKINGPOST",
      url: getSiteUrl(),
    },
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: getPostUrl(article.slug),
    keywords: article.tags.join(", "),
    articleSection: article.category,
  };

  const faqSchema =
    article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <>
      <JsonLdScript data={schema} />
      {faqSchema && <JsonLdScript data={faqSchema} />}
    </>
  );
}

function JsonLdScript({ data }: { data: object }) {
  // Escape "<" so author text like "</script>" can't break out of the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
