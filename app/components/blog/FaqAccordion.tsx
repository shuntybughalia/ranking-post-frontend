import type { FaqItem } from "@/lib/types";

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
}

/**
 * FAQ list. Native <details> keeps answers in the HTML for crawlers and needs no JS;
 * the open/close animation lives in globals.css (.faq-item).
 */
export default function FaqAccordion({
  faqs,
  title = "Frequently Asked Questions",
}: FaqAccordionProps) {
  if (faqs.length === 0) return null;

  // Items sharing a name behave as an exclusive accordion: opening one closes the others.
  const groupName = `faq-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2
        id="faq-heading"
        className="mb-5 text-[22px] font-bold leading-tight text-[#3a3a3a] sm:text-2xl md:text-[28px]"
      >
        {title}
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            name={groupName}
            open={index === 0}
            className="faq-item rounded-xl border border-border bg-white"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold leading-snug text-ink transition-colors duration-150 select-none hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 active:bg-cream sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
              <span>{faq.question}</span>
              <span
                aria-hidden="true"
                className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-gold-dark"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="faq-answer whitespace-pre-line px-4 pb-5 text-[15px] leading-relaxed text-muted sm:px-5 sm:text-base">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
