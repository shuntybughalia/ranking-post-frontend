import type { MetadataRoute } from "next";
import { getArticlesForListing } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      priority: 1.0,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/about-us`,
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: `${base}/contact-us`,
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: `${base}/pricing`,
      priority: 0.9,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/features`,
      priority: 0.9,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/login`,
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      url: `${base}/signup`,
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      url: `${base}/privacy-policy`,
      priority: 0.4,
      changeFrequency: "yearly",
    },
    {
      url: `${base}/terms-and-conditions`,
      priority: 0.4,
      changeFrequency: "yearly",
    },
    {
      url: `${base}/blog`,
      priority: 0.9,
      changeFrequency: "daily",
    },
    {
      url: `${base}/blog/seo`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/blog/content-marketing`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/blog/guest-posting`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/blog/digital-marketing`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${base}/blog/link-building`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
  ];

  let blogPosts: MetadataRoute.Sitemap = [];

  try {
    const articles = await getArticlesForListing();
    blogPosts = articles.map((article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("Sitemap skipped blog posts:", error);
  }

  return [...staticPages, ...blogPosts];
}
