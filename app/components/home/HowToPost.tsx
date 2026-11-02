import Link from "next/link";
import type { ReactNode } from "react";
import TimelineProgress from "./TimelineProgress";

interface Step {
  title: string;
  text: string;
  tags: string[];
  icon: ReactNode;
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// Matches how posting works on the site (see PostForm and lib/internal-links).
const steps: Step[] = [
  {
    title: "Create Your Free Account",
    text: "Sign up in a few moments. All you need is your name, email and a password.",
    tags: ["Free", "Quick Sign-Up"],
    icon: (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
    ),
  },
  {
    title: "Write Your Article",
    text: "Use the built-in editor to write, format and add images by URL. Your draft saves automatically as you go.",
    tags: ["Rich Editor", "Auto-Save", "Images"],
    icon: (
      <svg {...iconProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    ),
  },
  {
    title: "Add an Internal Link",
    text: "Link to at least one other RANKINGPOST page, such as a related article. It's required before you can publish.",
    tags: ["Required", "Internal Linking"],
    icon: (
      <svg {...iconProps}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: "Optimise for SEO",
    text: "Choose your URL, meta title, meta description and tags, and add FAQs to help your post show up in search and AI answers.",
    tags: ["Meta Tags", "Custom URL", "FAQs"],
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "Publish Your Post",
    text: "Hit publish and your article goes live straight away, with structured data and a place in our sitemap.",
    tags: ["Instant", "Sitemap", "Schema"],
    icon: (
      <svg {...iconProps}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    title: "Track and Update",
    text: "See how many views each post gets in My Posts, and edit your content or SEO details whenever you like.",
    tags: ["Views", "Edit Anytime"],
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

function StepCard({ step, index, alignRight }: { step: Step; index: number; alignRight: boolean }) {
  return (
    <div
      className={`timeline-card rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/20 backdrop-blur-sm transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-gold/50 ${
        alignRight ? "md:text-right" : ""
      }`}
    >
      <p className="bg-linear-to-r from-gold-light to-gold bg-clip-text text-3xl font-bold text-transparent">
        Step {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-2 text-lg font-bold text-white">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.text}</p>
      <ul className={`mt-4 flex flex-wrap gap-2 ${alignRight ? "md:justify-end" : ""}`}>
        {step.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Dark timeline explaining how to publish a guest post, alternating left and right. */
export default function HowToPost() {
  return (
    <section aria-labelledby="how-to-post-heading" className="timeline-bg mt-12 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200 sm:text-sm">
            <svg {...iconProps} width={16} height={16}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            How It Works
          </span>
          <h2
            id="how-to-post-heading"
            className="mt-5 bg-linear-to-r from-gold-light via-gold to-gold-light bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl"
          >
            How to Post on RANKINGPOST
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300 md:text-lg">
            From a free account to a live, search-friendly article in six simple steps.
          </p>
        </div>

        <ol className="relative mt-14">
          {/* Down the left on phones, through the centre from tablets up; fills as you scroll. */}
          <TimelineProgress />

          {steps.map((step, index) => {
            const cardOnLeft = index % 2 === 0;
            return (
              <li
                key={step.title}
                data-step
                className="timeline-step relative grid grid-cols-[3rem_1fr] gap-x-5 pb-10 last:pb-0 md:grid-cols-[1fr_4rem_1fr] md:gap-x-8 md:pb-0 md:[&:not(:first-child)]:-mt-8"
              >
                <div className={`hidden md:block ${cardOnLeft ? "" : "md:invisible"}`}>
                  {cardOnLeft && <StepCard step={step} index={index} alignRight />}
                </div>

                <div className="relative z-10 flex justify-center md:items-center">
                  <span
                    data-step-icon
                    className="timeline-icon mt-6 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-ink md:mt-0"
                  >
                    {step.icon}
                  </span>
                </div>

                <div className="md:hidden">
                  <StepCard step={step} index={index} alignRight={false} />
                </div>
                <div className={`hidden md:block ${cardOnLeft ? "md:invisible" : ""}`}>
                  {!cardOnLeft && <StepCard step={step} index={index} alignRight={false} />}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 text-center">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-gold to-gold-light px-8 py-3.5 font-semibold text-ink shadow-[0_0_20px_rgb(214_165_49/0.35)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgb(214_165_49/0.55)]"
          >
            Start Writing Now
            <svg {...iconProps} width={18} height={18} strokeWidth={2.5}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
