"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { SESSION_CHANGED_EVENT } from "@/lib/session-events";
import type { SessionUser } from "@/lib/types";
import BrandLogo from "@/app/components/layout/BrandLogo";
import NotificationsMenu from "@/app/components/layout/NotificationsMenu";
import UserMenu from "@/app/components/layout/UserMenu";
import { siteContainer } from "@/app/components/layout/siteContainer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadSession = useCallback(() => {
    // Logged-out visitors get a 401 here; that's expected, so no toast.
    apiFetch<{ user: SessionUser | null }>("/api/auth/me", { toastOnError: false })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Re-check the session on navigation so login/logout redirects update the nav.
  useEffect(() => {
    loadSession();
  }, [pathname, loadSession]);

  // Profile edits (e.g. a new display name) announce themselves so the avatar updates.
  useEffect(() => {
    window.addEventListener(SESSION_CHANGED_EVENT, loadSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, loadSession);
  }, [loadSession]);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      // apiFetch already showed the error toast.
    }
  }

  // The admin area has its own layout and navigation.
  if (pathname.startsWith("/admin")) return null;

  const writeHref = user ? "/submit" : "/login?redirect=/submit";

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b-[0.8px] border-[#d5d5d5] bg-white text-[14px] leading-[21px] text-[#333]">
      <div className={`${siteContainer} flex min-h-[64px] flex-wrap items-center justify-between gap-x-2 sm:gap-x-4`}>
        <BrandLogo className="py-2" />

        <nav className="hidden flex-1 items-center justify-end min-[62rem]:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-[18px] py-[23px] text-[16px] font-semibold transition-colors hover:text-gold-dark ${
                isActive(link.href) ? "text-gold-dark" : "text-[#30384e]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Form
          action="/blog"
          role="search"
          aria-label="Blog search"
          onSubmit={() => setMobileOpen(false)}
          className="order-last mb-3 flex w-full items-center rounded-full border border-border bg-cream/50 focus-within:border-gold-dark min-[75rem]:order-none min-[75rem]:mb-0 min-[75rem]:w-48"
        >
          <input
            type="search"
            name="q"
            aria-label="Search blog posts"
            placeholder="Search blogs…"
            required
            className="min-w-0 flex-1 rounded-l-full bg-transparent py-2 pl-4 text-base text-ink outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            aria-label="Search blogs"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gold-dark hover:bg-gold/15 focus-visible:outline-2 focus-visible:outline-gold-dark"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>
          </button>
        </Form>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <Link
            href={writeHref}
            className={`rounded-full px-2 py-1.5 text-[15px] font-medium transition-colors hover:text-gold-dark sm:px-3 ${
              pathname.startsWith("/submit") ? "text-gold-dark" : "text-[#30384e]"
            }`}
          >
            Write
          </Link>
          <NotificationsMenu user={authLoading ? null : user} />
          <UserMenu user={user} loading={authLoading} onLogout={handleLogout} />

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-9 items-center justify-center text-[#30384e] sm:ml-1 min-[62rem]:hidden"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t-[0.8px] border-[#d5d5d5] bg-white min-[62rem]:hidden">
          <div className={`${siteContainer} flex flex-col py-2`}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`border-b-[0.8px] border-[#eee] px-2 py-3 text-[16px] font-semibold transition-colors last:border-b-0 hover:text-gold-dark ${
                  isActive(link.href) ? "text-gold-dark" : "text-[#30384e]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
