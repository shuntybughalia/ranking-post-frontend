import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Generator from "./Generator";

export const metadata: Metadata = {
  title: "AI Guest Post Blog Generator",
  robots: { index: false },
};

export default async function GuestPostGeneratorPage() {
  if (!(await getSession())) redirect("/login?redirect=/guest-post-generator");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">AI Guest Post Blog Generator</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        Turn a primary keyword into an editable guest post with SEO metadata and FAQs.
      </p>
      <Generator />
    </main>
  );
}
