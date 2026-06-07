export default function Hero() {
  return (
    <section className="bg-navy px-6 py-16 text-center md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          SEO Insights &amp; Strategies
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
          Stay ahead of the curve with expert analysis, data-driven guest posting
          guides, and elite digital marketing strategies.
        </p>

        <div className="relative mx-auto mt-8 max-w-xl">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search for articles, guides, or case studies..."
            className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-5 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>
    </section>
  );
}
