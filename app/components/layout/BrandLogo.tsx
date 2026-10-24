import Image from "next/image";
import Link from "next/link";

/** Logo mark + RANKINGPOST wordmark, shared by the header and footer. */
export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center gap-2 text-[19px] font-extrabold leading-none tracking-tight min-[420px]:gap-2.5 min-[420px]:text-[24px] ${className}`}
    >
      {/* Slightly smaller on narrow phones so the header icons fit beside it. */}
      <Image src="/logo.png" alt="" width={40} height={40} className="h-8 w-8 min-[420px]:h-10 min-[420px]:w-10" preload />
      <span>
        <span className="text-ink">RANKING</span>
        <span className="text-gold-dark">POST</span>
      </span>
    </Link>
  );
}
