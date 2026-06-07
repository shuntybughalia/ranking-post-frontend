import type { Metadata } from "next";
import Header from "../components/Header";
import BlogListing from "./BlogListing";

export const metadata: Metadata = {
  title: "Blog — RANKINGPOST",
  description: "Expert SEO insights, link building strategies, and content marketing guides.",
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <section className="bg-navy px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Deep dives into guest posting, search strategy, and digital growth.
        </p>
      </section>
      <BlogListing />
    </>
  );
}
