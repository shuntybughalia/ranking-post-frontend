import Image from "next/image";
import Link from "next/link";

/** Logo mark + RANKINGPOST wordmark, shared by the header and footer. */
export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 text-[24px] font-extrabold leading-none tracking-tight ${className}`}
    >
      <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" preload />
      <span>
        <span className="text-ink">RANKING</span>
        <span className="text-gold-dark">POST</span>
      </span>
    </Link>
  );
}
