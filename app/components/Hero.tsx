import HeroSearch from "./HeroSearch";

export default function Hero() {
  return (
    <section className="bg-navy px-6 py-16 text-center md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          Grow Your Traffic with Proven SEO Strategies
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
          Stay ahead of the curve with expert analysis, data-driven guest posting
          guides, and elite digital marketing strategies.
        </p>

        <HeroSearch />
      </div>
    </section>
  );
}
