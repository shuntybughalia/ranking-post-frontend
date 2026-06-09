import "server-only";
import { readJson, writeJson } from "./db";
import type { MarketPackage } from "./types";

const MARKET_FILE = "market.json";

const DEFAULT_PACKAGES: MarketPackage[] = [
  {
    id: "pkg-1",
    name: "Authority Boost",
    description: "High-DA guest post on a top-tier SEO publication with dofollow link.",
    price: 299,
    da: 65,
    traffic: "50K+/mo",
    niche: "SEO & Marketing",
    turnaround: "5-7 days",
  },
  {
    id: "pkg-2",
    name: "Niche Dominator",
    description: "Targeted placement in your industry vertical with contextual anchor text.",
    price: 199,
    da: 45,
    traffic: "25K+/mo",
    niche: "Business",
    turnaround: "3-5 days",
  },
  {
    id: "pkg-3",
    name: "Starter Link",
    description: "Budget-friendly guest post on a growing blog with solid metrics.",
    price: 79,
    da: 30,
    traffic: "10K+/mo",
    niche: "General",
    turnaround: "2-3 days",
  },
  {
    id: "pkg-4",
    name: "Premium Health",
    description: "YMYL-compliant health publication with editorial review included.",
    price: 449,
    da: 72,
    traffic: "100K+/mo",
    niche: "Health",
    turnaround: "7-10 days",
  },
];

export async function getMarketPackages(): Promise<MarketPackage[]> {
  const packages = await readJson<MarketPackage[]>(MARKET_FILE, DEFAULT_PACKAGES);
  if (packages.length === 0) {
    await writeJson(MARKET_FILE, DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES;
  }
  return packages;
}
