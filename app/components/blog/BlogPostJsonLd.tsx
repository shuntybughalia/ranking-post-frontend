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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
