import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Generator from "@/app/guest-post-generator/Generator";
import PostForm from "@/app/components/posts/PostForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Submit a Guest Post",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function SubmitPostPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/submit");
  }

  return (
    <>
      <section aria-labelledby="generator-heading" className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6">
        <h2 id="generator-heading" className="text-2xl font-bold text-navy sm:text-3xl">
          AI Guest Post Blog Generator
        </h2>
        <p className="mb-6 mt-2 text-sm text-muted">
          Turn a primary keyword into an editable guest post with SEO metadata and FAQs.
        </p>
        <Generator />
      </section>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">Submit Post</h1>
          <p className="mt-1 text-sm text-muted">
            Create a new blog post with SEO metadata and rich content.
          </p>
        </div>
        <PostForm
          mode="create"
          authorName={session.name}
        />
      </div>
    </>
  );
}
