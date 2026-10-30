import type { Metadata } from "next";

interface PageSeo {
  /** Full title, including the site name; keep it to about 60 characters. */
  title: string;
  /** About 150 characters. */
  description: string;
  path: string;
}

/** Title, description, canonical and matching social tags for one public page. */
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "RANKINGPOST",
      locale: "en_US",
      url: path,
      title,
      description,
      images: [{ url: "/logo.png", alt: "RANKINGPOST" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}
