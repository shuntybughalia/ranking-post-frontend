import Image from "next/image";
import Link from "next/link";

/** Each letter is its own span so hovering can send a wave through the name. */
function Letters({ text, offset = 0 }: { text: string; offset?: number }) {
  return text.split("").map((letter, index) => (
    <span
      key={index}
      className="brand-letter"
      style={{ "--i": index + offset } as React.CSSProperties}
    >
      {letter}
    </span>
  ));
}

/** Logo mark + RANKINGPOST wordmark, shared by the header and footer. */
export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="RANKINGPOST home"
      className={`group inline-flex shrink-0 items-center gap-2 text-[19px] font-extrabold leading-none tracking-tight min-[420px]:gap-2.5 min-[420px]:text-[24px] ${className}`}
    >
      {/* Slightly smaller on narrow phones so the header icons fit beside it. */}
      <span className="brand-logo-mark relative block h-8 w-8 shrink-0 min-[420px]:h-10 min-[420px]:w-10">
        <Image src="/logo.png" alt="" width={40} height={40} className="h-full w-full" preload />
        {/* Traces the logo's growth arrow so a light can run up it (coordinates match the 512px artwork). */}
        <svg viewBox="0 0 512 512" aria-hidden="true" className="brand-arrow absolute inset-0 h-full w-full">
          <path
            className="brand-arrow-trail"
            d="M112 322 Q 238 292 300 194"
            pathLength={100}
            fill="none"
            strokeLinecap="round"
          />
          <path className="brand-arrow-head" d="M327 172 L282 186 L310 214 Z" />
        </svg>
      </span>
      <span className="brand-logo-word" aria-hidden="true">
        <span className="brand-logo-ranking text-ink">
          <Letters text="RANKING" />
        </span>
        <span className="brand-logo-post text-gold-dark">
          <Letters text="POST" offset={7} />
        </span>
      </span>
    </Link>
  );
}
