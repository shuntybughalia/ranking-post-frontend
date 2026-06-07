"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Market", href: "/market" },
  { label: "Orders", href: "/orders" },
  { label: "Stats", href: "/stats" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-navy hover:bg-slate-100 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-bold tracking-tight text-navy">
            RANKINGPOST
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm transition-colors hover:text-navy ${
                  isActive
                    ? "font-semibold text-navy"
                    : "font-medium text-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle dark mode"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-navy sm:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-navy sm:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
