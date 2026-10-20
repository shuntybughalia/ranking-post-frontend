"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { SessionUser } from "@/lib/types";
import BrandLogo from "@/app/components/layout/BrandLogo";
import HeaderAuth from "@/app/components/layout/HeaderAuth";
import { siteContainer } from "@/app/components/layout/siteContainer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Services", href: "/services" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Re-check the session on navigation so login/logout redirects update the nav.
  useEffect(() => {
    // Logged-out visitors get a 401 here; that's expected, so no toast.
    apiFetch<{ user: SessionUser | null }>("/api/auth/me", { toastOnError: false })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, [pathname]);

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

  const submitHref = user ? "/submit" : "/login?redirect=/submit";

  // The admin area has its own layout and navigation.
  if (pathname.startsWith("/admin")) return null;
  const links = [
    ...navLinks.map((link) => ({ ...link, match: link.href })),
    { label: "Submit Post", href: submitHref, match: "/submit" },
  ];

  function isActive(match: string) {
    return match === "/" ? pathname === "/" : pathname.startsWith(match);
  }

  return (
    <header className="sticky top-0 z-50 border-b-[0.8px] border-[#d5d5d5] bg-white text-[14px] leading-[21px] text-[#333]">
      <div className={`${siteContainer} flex min-h-[64px] items-center justify-between`}>
        <BrandLogo className="py-2" />

        <nav className="hidden flex-1 flex-wrap items-center justify-end min-[62rem]:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-[18px] py-[23px] text-[16px] font-semibold transition-colors hover:text-gold-dark ${
                isActive(link.match) ? "text-gold-dark" : "text-[#30384e]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <HeaderAuth user={user} loading={authLoading} onLogout={handleLogout} />
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center text-[#30384e] min-[62rem]:hidden"
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

      {mobileOpen && (
        <nav className="border-t-[0.8px] border-[#d5d5d5] bg-white min-[62rem]:hidden">
          <div className={`${siteContainer} flex flex-col py-2`}>
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`border-b-[0.8px] border-[#eee] px-2 py-3 text-[16px] font-semibold transition-colors hover:text-gold-dark ${
                  isActive(link.match) ? "text-gold-dark" : "text-[#30384e]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-wrap items-center pt-1">
              <HeaderAuth user={user} loading={authLoading} onLogout={handleLogout} compact />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
