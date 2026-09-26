import type { Metadata } from "next";
import Header from "../components/Header";
import { getMarketPackages } from "@/lib/market";
import MarketGrid from "./MarketGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market — RANKINGPOST",
  description:
    "Browse guest posting packages and link building services for your SEO strategy.",
};

export default async function MarketPage() {
  const packages = await getMarketPackages();

  return (
    <>
      <Header />
      <section className="bg-navy px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          Guest Post Marketplace
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Premium placements on high-authority sites. Choose a package and start
          building your backlink profile today.
        </p>
      </section>
      <MarketGrid packages={packages} />
    </>
  );
}
