"use client";

export default function NewsletterCTA() {
  return (
    <section className="relative mt-12 overflow-hidden rounded-2xl bg-navy px-8 py-10 md:px-12 md:py-14">
      <div className="relative z-10 max-w-lg">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Master the Search Results
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">
          Get weekly insights on guest posting, link building, and content
          strategy delivered straight to your inbox.
        </p>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your business email"
            className="flex-1 rounded-lg border-0 bg-white px-4 py-3 text-sm text-foreground outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-accent/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
          >
            Subscribe Now
          </button>
        </form>

        <p className="mt-4 text-xs italic text-slate-400">
          Join 15,000+ SEO professionals already on the list.
        </p>
      </div>

      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 md:block">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          className="opacity-10"
        >
          <path
            d="M20 120 L60 80 L90 95 L140 30"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M120 30 L140 30 L140 50"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
