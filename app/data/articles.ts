export type Category = "All Posts" | "SEO" | "Link Building" | "Content Marketing" | "Case Studies";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: Exclude<Category, "All Posts">;
  readTime: string;
  author: string;
  date: string;
  image: string;
  featured?: boolean;
}

export const categories: Category[] = [
  "All Posts",
  "SEO",
  "Link Building",
  "Content Marketing",
  "Case Studies",
];

export const articles: Article[] = [
  {
    id: "1",
    title: "The Future of Guest Posting in 2024: Moving Beyond Backlinks",
    excerpt:
      "Discover why relevance and authority are outpacing volume in the new era of search. We analyze data from over 5,000 successful campaigns to show you what works today.",
    category: "Case Studies",
    readTime: "8 min read",
    author: "Alex Rivera",
    date: "Mar 12",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    featured: true,
  },
  {
    id: "2",
    title: "Mastering the Art of Semantic Keywords",
    excerpt:
      "Learn how to build topical authority with entity-based keyword clusters that align with modern search intent models.",
    category: "SEO",
    readTime: "5 min",
    author: "Sarah Chen",
    date: "Feb 28",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  },
  {
    id: "3",
    title: "White-Hat Link Building Strategies That Scale",
    excerpt:
      "Proven outreach frameworks and relationship-building tactics used by top agencies to earn high-authority placements.",
    category: "Link Building",
    readTime: "7 min",
    author: "Marcus Webb",
    date: "Feb 22",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    id: "4",
    title: "Content Clusters: The Blueprint for Topical Dominance",
    excerpt:
      "A step-by-step guide to structuring pillar pages and supporting content that captures entire keyword ecosystems.",
    category: "Content Marketing",
    readTime: "6 min",
    author: "Emily Park",
    date: "Feb 15",
    image:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80",
  },
];
