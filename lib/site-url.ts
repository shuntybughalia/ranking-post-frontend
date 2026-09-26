export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.rankingpost.com"
  );
}

export function getPostUrl(slug: string): string {
  return `${getSiteUrl()}/blog/${slug}`;
}
