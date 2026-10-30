import type { Metadata } from "next";
import Link from "next/link";
import { siteContainer } from "@/app/components/layout/siteContainer";
import { pageMetadata } from "@/lib/seo";
import ContactForm from "./ContactForm";

const CONTACT_EMAIL = "monietcriss@gmail.com";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us | RANKINGPOST",
  description:
    "Get in touch with RANKINGPOST about guest posting, SEO packages or anything else. Send us a message through the form or by email.",
  path: "/contact-us",
});

const topics = [
  {
    title: "Guest posting",
    text: "Questions about submitting, editing or publishing a post.",
  },
  {
    title: "SEO services",
    text: "Help choosing a package, or a custom plan for your site.",
  },
  {
    title: "Your account",
    text: "Trouble signing in or managing your profile.",
  },
];

export default function ContactUsPage() {
  return (
    <>
      <section className="bg-navy px-6 py-14 text-center md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300 md:text-lg">
          Have a question about guest posting or our SEO services? Send us a
          message and we&apos;ll get back to you by email.
        </p>
      </section>

      <main className={`${siteContainer} grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]`}>
        <section aria-labelledby="contact-details-heading">
          <h2 id="contact-details-heading" className="text-xl font-bold text-navy">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm text-muted">Prefer email? Write to us directly:</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 inline-block break-all font-semibold text-gold-dark hover:underline"
          >
            {CONTACT_EMAIL}
          </a>

          <h2 className="mt-8 text-xl font-bold text-navy">How We Can Help</h2>
          <ul className="mt-3 space-y-3">
            {topics.map((topic) => (
              <li key={topic.title} className="rounded-xl bg-cream px-4 py-3">
                <h3 className="text-sm font-bold text-navy">{topic.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{topic.text}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-muted">
            Looking for quick answers? See the{" "}
            <Link href="/#faq-heading" className="font-semibold text-gold-dark hover:underline">
              FAQs on our homepage
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="sr-only">
            Send us a message
          </h2>
          <ContactForm />
        </section>
      </main>
    </>
  );
}
