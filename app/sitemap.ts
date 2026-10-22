import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-url";

/** Generated at request time so the build does not require MongoDB. */
export const dynamic = "force-dynamic";

async function getPublishedArticlesForSitemap() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }

  try {
    return await getArticles();
  } catch (error) {
    console.warn(
      "Sitemap: skipping blog posts (articles unavailable):",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const articles = await getPublishedArticlesForSitemap();
  // Newest post edit doubles as the "last changed" date for pages that list posts.
  const latestPostUpdate = articles.reduce<string | undefined>(
    (latest, article) =>
      !latest || new Date(article.updatedAt) > new Date(latest) ? article.updatedAt : latest,
    undefined,
  );

  // Only public, indexable routes that exist under app/. Auth-gated pages
  // (login, register, submit, my-posts, orders, admin) are left out.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: latestPostUpdate,
      priority: 1.0,
      changeFrequency: "daily",
    },
    {
      url: `${base}/blog`,
      lastModified: latestPostUpdate,
      priority: 0.9,
      changeFrequency: "daily",
    },
    {
      url: `${base}/services`,
      priority: 0.9,
      changeFrequency: "monthly",
    },
    {
      url: `${base}/market`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/stats`,
      priority: 0.5,
      changeFrequency: "weekly",
    },
  ];

  const blogPosts: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPosts];
}
