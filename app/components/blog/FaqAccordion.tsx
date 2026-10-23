import type { FaqItem } from "@/lib/types";

interface FaqAccordionProps {
  faqs: FaqItem[];
}

/** Post FAQ list. Native <details> keeps answers in the HTML for crawlers and needs no JS. */
export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="mb-5 text-2xl font-bold text-[#3a3a3a] md:text-[28px]">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-border rounded-md border border-border">
        {faqs.map((faq, index) => (
          <details key={index} className="group" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink transition-colors hover:bg-cream [&::-webkit-details-marker]:hidden">
              {faq.question}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 text-gold-dark transition-transform group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p className="whitespace-pre-line px-5 pb-5 text-base leading-relaxed text-muted">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
