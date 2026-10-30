import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteContainer } from "@/app/components/layout/siteContainer";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us: Guest Posting & SEO Platform | RANKINGPOST",
  description:
    "RANKINGPOST is a guest posting and SEO platform where writers publish SEO-friendly articles and businesses grow with on-page, off-page and AI SEO services.",
  path: "/about-us",
});

const offerings = [
  {
    title: "Guest Posting",
    text: "Create a free account and publish your articles in the niche that fits, from business and technology to finance, health and travel.",
    href: "/submit",
    linkLabel: "Submit a post",
  },
  {
    title: "SEO Guides",
    text: "Read practical articles on SEO, digital marketing and content from the writers publishing on our blog.",
    href: "/blog",
    linkLabel: "Read the blog",
  },
  {
    title: "SEO Services",
    text: "Choose a package that combines on-page SEO, off-page SEO and AI SEO, with prices listed openly from Basic to Premium.",
    href: "/services",
    linkLabel: "View packages",
  },
];

const steps = [
  {
    title: "Create your account",
    text: "Sign up for free in a few moments.",
  },
  {
    title: "Write your post",
    text: "Use the built-in editor, and your draft saves automatically as you work.",
  },
  {
    title: "Set your SEO details",
    text: "Choose your URL, meta title, meta description, tags and FAQs.",
  },
  {
    title: "Publish and track",
    text: "Your post goes live and joins our sitemap. Follow its views from My Posts.",
  },
];

const values = [
  {
    title: "Search-friendly by default",
    text: "Every post gets a clean URL, structured data and a place in our sitemap, so search engines can find and understand it.",
  },
  {
    title: "Control stays with the author",
    text: "You can edit your content and SEO settings whenever you need to, even after publishing.",
  },
  {
    title: "Clear pricing",
    text: "Our SEO packages and what each one includes are published on the site, so you know what you're getting before you get in touch.",
  },
];

export default function AboutUsPage() {
  return (
    <>
      <section className="bg-navy py-14 md:py-16">
        <div className={`${siteContainer} grid items-center gap-10 md:grid-cols-2`}>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              About RANKINGPOST
            </h1>
            <p className="mt-4 max-w-xl text-slate-300 max-md:mx-auto md:text-lg">
              A guest posting and SEO platform that helps writers get published
              and helps businesses grow their organic traffic.
            </p>
          </div>
          <Image
            src="/images/services-ui-ux.svg"
            alt="Website design with SEO ranking growth"
            width={560}
            height={420}
            priority
            className="mx-auto h-auto w-full max-w-[460px]"
          />
        </div>
      </section>

      <main className={`${siteContainer} py-12`}>
        <section className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-navy md:text-3xl">Who We Are</h2>
          <p className="mt-4 leading-relaxed text-muted">
            RANKINGPOST brings guest posting, SEO knowledge and SEO services
            together in one place. Writers and businesses publish articles here
            to reach new readers, while readers come for practical guides across
            a wide range of topics. If you&apos;d rather have the work done for
            you, our SEO packages cover your website from every angle.
          </p>
        </section>

        <section className="py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy md:text-3xl">
            What We Offer
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {offerings.map((offering) => (
              <div
                key={offering.title}
                className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-navy">{offering.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{offering.text}</p>
                <Link
                  href={offering.href}
                  className="mt-5 text-sm font-semibold text-gold-dark hover:underline"
                >
                  {offering.linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-cream px-6 py-10 md:px-10">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy md:text-3xl">
            How Guest Posting Works
          </h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink"
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 font-bold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy md:text-3xl">
            What We Care About
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title}>
                <h3 className="font-bold text-navy">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-navy px-6 py-10 text-center md:px-12">
          <h2 className="text-2xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-300">
            Publish your first guest post, or talk to us about your SEO goals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/submit"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Submit a guest post
            </Link>
            <Link
              href="/contact-us"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
            >
              Contact us
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
