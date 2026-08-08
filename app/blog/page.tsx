import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../components/Header";
import { getArticles } from "@/lib/articles";
import BlogListing from "./BlogListing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — RANKINGPOST",
  description:
    "Expert SEO insights, link building strategies, and content marketing guides.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      <Header />
      <section className="bg-navy px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Deep dives into guest posting, search strategy, and digital growth.
        </p>
      </section>
      <Suspense>
        <BlogListing articles={articles} />
      </Suspense>
    </>
  );
}
