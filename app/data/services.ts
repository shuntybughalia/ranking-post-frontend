export interface ServiceFeatureGroup {
  title: "On-Page SEO" | "Off-Page SEO" | "AI SEO";
  features: string[];
}

export interface ServicePackage {
  name: "Basic" | "Standard" | "Premium";
  price: number;
  tagline: string;
  groups: ServiceFeatureGroup[];
  popular?: boolean;
}

/** Monthly prices in USD. Edit here to update the services page. */
export const servicePackages: ServicePackage[] = [
  {
    name: "Basic",
    price: 100,
    tagline: "For small sites getting the fundamentals right.",
    groups: [
      {
        title: "On-Page SEO",
        features: [
          "Up to 5 pages optimised",
          "Keyword research for each page",
          "Title, meta description and heading fixes",
          "Image alt text optimisation",
        ],
      },
      {
        title: "Off-Page SEO",
        features: [
          "5 guest posts on DA 30+ sites",
          "Business directory and citation listings",
          "Anchor text planning",
        ],
      },
      {
        title: "AI SEO",
        features: [
          "FAQ content written for AI answers",
          "Basic schema markup",
          "Visibility check in ChatGPT and Google AI Overviews",
        ],
      },
    ],
  },
  {
    name: "Standard",
    price: 150,
    tagline: "For growing businesses that want steady gains.",
    popular: true,
    groups: [
      {
        title: "On-Page SEO",
        features: [
          "Up to 15 pages optimised",
          "Internal linking plan",
          "Content gap and copy improvements",
          "Core Web Vitals review",
        ],
      },
      {
        title: "Off-Page SEO",
        features: [
          "10 guest posts on DA 40+ sites",
          "Niche-relevant blogger outreach",
          "Broken link building",
          "Toxic backlink audit",
        ],
      },
      {
        title: "AI SEO",
        features: [
          "Content structured for AI Overviews, ChatGPT and Perplexity",
          "Entity and brand knowledge optimisation",
          "Advanced schema markup",
          "Monthly AI visibility tracking",
        ],
      },
    ],
  },
  {
    name: "Premium",
    price: 200,
    tagline: "For competitive niches and larger sites.",
    groups: [
      {
        title: "On-Page SEO",
        features: [
          "Up to 40 pages optimised",
          "Full technical SEO audit and fixes",
          "Crawl, index and duplicate content cleanup",
          "Competitor on-page analysis",
        ],
      },
      {
        title: "Off-Page SEO",
        features: [
          "20 guest posts on DA 50+ sites",
          "Digital PR and brand mentions",
          "Competitor backlink gap analysis",
          "Disavow file management",
        ],
      },
      {
        title: "AI SEO",
        features: [
          "Generative engine optimisation (GEO) strategy",
          "AI citation building across trusted sources",
          "llms.txt and AI crawler setup",
          "Competitor AI visibility benchmarking",
        ],
      },
    ],
  },
];
