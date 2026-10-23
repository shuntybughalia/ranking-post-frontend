"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { categories } from "@/app/data/articles";

/** Category links shown under the header on every public page. */
export default function CategoryBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The admin area has its own layout and navigation.
  if (pathname.startsWith("/admin")) return null;

  const activeCategory = pathname === "/blog" ? searchParams.get("category") : null;

  return (
    <nav aria-label="Categories" className="border-b border-border bg-slate-50">
      {/* Centered when the pills fit, horizontally scrollable when they don't. */}
      <div className="overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex w-max gap-2">
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <li key={category}>
                <Link
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-navy text-white"
                      : "border border-border bg-white text-muted hover:border-slate-300 hover:text-navy"
                  }`}
                >
                  {category}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
