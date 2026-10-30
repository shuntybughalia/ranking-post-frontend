import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteContainer } from "@/app/components/layout/siteContainer";
import ReviewsSection from "@/app/components/ui/ReviewsSection";
import { seoServiceReviews } from "@/app/data/reviews";
import { servicePackages, type ServicePackage } from "@/app/data/services";
import { pageMetadata } from "@/lib/seo";

const CONTACT_EMAIL = "monietcriss@gmail.com";

const lowestPrice = Math.min(...servicePackages.map((pkg) => pkg.price));

export const metadata: Metadata = pageMetadata({
  title: "SEO Packages: On-Page, Off-Page & AI SEO | RANKINGPOST",
  description: `SEO packages from $${lowestPrice} a month. Every plan combines on-page SEO, off-page SEO and AI SEO to grow your rankings and organic traffic.`,
  path: "/services",
});

const pillars = [
  {
    title: "On-Page SEO",
    text: "Optimise your pages so search engines understand them and visitors stay longer.",
  },
  {
    title: "Off-Page SEO",
    text: "Build authority with quality backlinks and brand mentions.",
  },
  {
    title: "AI SEO",
    text: "Get your brand cited in ChatGPT, Perplexity and Google AI Overviews.",
  },
];

function orderHref(pkg: ServicePackage) {
  const subject = `${pkg.name} SEO package`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

function PackageCard({ pkg }: { pkg: ServicePackage }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
        pkg.popular ? "border-gold ring-1 ring-gold" : "border-border"
      }`}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-ink">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-bold text-navy">{pkg.name}</h3>
      <p className="mt-1 text-sm text-muted">{pkg.tagline}</p>
      <p className="mt-5 text-navy">
        <span className="text-4xl font-bold">${pkg.price}</span>
        <span className="text-sm text-muted"> / month</span>
      </p>

      <div className="mt-6 flex-1 space-y-5">
        {pkg.groups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gold-dark">
              {group.title}
            </h4>
            <ul className="space-y-2 text-sm text-[#30384e]">
              {group.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <a
        href={orderHref(pkg)}
        className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
          pkg.popular ? "bg-accent text-ink" : "bg-navy text-white"
        }`}
      >
        Get started
      </a>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <section className="bg-navy py-14 md:py-16">
        <div className={`${siteContainer} grid items-center gap-10 md:grid-cols-2`}>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              SEO Services
            </h1>
            <p className="mt-4 max-w-xl text-slate-300 max-md:mx-auto md:text-lg">
              Every package combines on-page SEO, off-page SEO and AI SEO, built
              around a fast, user-friendly site. Pick the plan that fits you,
              from Basic to Premium.
            </p>
            <a
              href="#packages"
              className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              View packages
            </a>
          </div>
          <Image
            src="/images/services-ui-ux.svg"
            alt="Website UI and UX design with SEO ranking growth"
            width={560}
            height={420}
            priority
            className="mx-auto h-auto w-full max-w-[520px]"
          />
        </div>
      </section>

      <main className={`${siteContainer} py-12`}>
        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-xl bg-cream px-5 py-4">
              <h2 className="font-bold text-navy">{pillar.title}</h2>
              <p className="mt-1 text-sm text-muted">{pillar.text}</p>
            </div>
          ))}
        </section>

        <section id="packages" className="scroll-mt-24 py-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-navy md:text-3xl">
              Choose Your Package
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted">
              All three services are included in every plan. Higher plans cover
              more pages, stronger backlinks and deeper AI optimisation.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {servicePackages.map((pkg) => (
              <PackageCard key={pkg.name} pkg={pkg} />
            ))}
          </div>
        </section>

        <ReviewsSection
          title="What Our SEO Clients Say"
          subtitle="Results and feedback from businesses using our SEO packages."
          reviews={seoServiceReviews}
        />

        <section className="rounded-2xl bg-cream px-6 py-10 text-center md:px-12">
          <h2 className="text-2xl font-bold text-navy">Need a custom plan?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            Tell us your goals and we&apos;ll put together a package for you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Custom SEO plan")}`}
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Contact us
            </a>
            <Link
              href="/blog"
              className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-gold"
            >
              Read our SEO guides
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
