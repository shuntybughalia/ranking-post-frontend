import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Generator from "@/app/guest-post-generator/Generator";
import PostForm from "@/app/components/posts/PostForm";
import { getSession } from "@/lib/auth";
import { EXTRA_POST_PRICE } from "@/lib/post-pricing";

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
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <section aria-labelledby="generator-heading" className="recent-posts-backdrop rounded-2xl border border-gold/20 px-4 py-4 shadow-lg sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="ai-generator-sparkle flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-xl text-gold-light">✦</span>
            <div>
              <h1 id="generator-heading" className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                AI Guest Post <span className="text-gold-light">Generator</span>
              </h1>
              <p className="text-sm text-slate-200">Turn a keyword into a draft with SEO metadata and FAQs.</p>
            </div>
          </div>
          <a href="#post-form" className="rounded-lg border border-gold/40 px-3 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/15">
            Write my own post
          </a>
        </div>
        <div className="mt-4">
          <Generator compact />
        </div>
      </section>

      <section id="post-form" aria-labelledby="post-form-heading" className="scroll-mt-24 py-10">
        <h2 id="post-form-heading" className="text-2xl font-bold text-navy">Submit your post</h2>
        <aside className="mb-6 mt-3 rounded-xl border border-gold/25 bg-cream px-4 py-3 text-sm leading-relaxed text-ink">
          <strong>1 free post per calendar month</strong> (US Eastern Time). Extra posts cost <strong>{EXTRA_POST_PRICE} each</strong> and go live after the super admin confirms payment.
        </aside>
        <PostForm mode="create" authorName={session.name} />
      </section>
    </main>
  );
}
