"use client";

import Link from "next/link";
import { useState } from "react";

const topics = [
  {
    question: "How do I find articles?",
    answer: "Open Blog to browse recent articles, choose a category, or use the header search to find posts by keyword.",
  },
  {
    question: "How do I generate a draft?",
    answer: "Enter a primary keyword in the AI Guest Post Generator. Add a target URL if you want a contextual backlink, then select Generate guest post. Review and edit the draft before copying it into the submission form.",
  },
  {
    question: "What does my post need?",
    answer: "Add an original article, title, short description, category and featured image. Include at least one link to another RankingPost page in the article. FAQs and SEO metadata can be added before publishing.",
  },
  {
    question: "How much does posting cost?",
    answer: "Your first post each calendar month is free (India time). Extra posts cost ₹100 each and stay pending until the super admin confirms payment. Contact the RankingPost team to arrange payment.",
  },
  {
    question: "Where is my draft or pending post?",
    answer: "Open My Posts to find your saved drafts and check your submission status.",
  },
];

export default function SiteHelp() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:left-auto sm:right-6">
      {open && (
        <section id="post-help-panel" aria-labelledby="post-help-heading"
          className="recent-posts-backdrop max-h-[60dvh] w-full overflow-y-auto rounded-2xl border border-gold/30 p-4 text-sm text-white shadow-xl sm:w-88">
          <h2 id="post-help-heading" className="text-base font-bold text-gold-light">RankingPost help</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map(({ question }, index) => (
              <button key={question} type="button" aria-pressed={selected === index}
                onClick={() => setSelected(index)}
                className="rounded-lg border border-gold/30 px-2.5 py-2 text-left hover:bg-gold/15 aria-pressed:bg-gold/25">
                {question}
              </button>
            ))}
          </div>
          <div aria-live="polite" className="mt-3 rounded-xl bg-white/10 p-3 leading-relaxed">
            {selected === null ? "Choose a question to get started." : topics[selected].answer}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-gold-light">
            <Link href="/blog" className="underline underline-offset-4">Browse Blog</Link>
            <Link href="/my-posts" className="underline underline-offset-4">My Posts</Link>
            <Link href="/contact-us" className="underline underline-offset-4">Contact us</Link>
          </div>
        </section>
      )}
      <button type="button" aria-expanded={open} aria-controls={open ? "post-help-panel" : undefined}
        onClick={() => setOpen(!open)}
        className="rounded-full border border-gold/40 bg-linear-to-r from-gold-light to-gold px-4 py-2.5 text-sm font-semibold text-ink shadow-md">
        {open ? "Close help" : "✦ Need help?"}
      </button>
    </div>
  );
}
