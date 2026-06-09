"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin", exact: true },
  { label: "Articles", href: "/admin/articles" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Newsletter", href: "/admin/newsletter" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminMobileNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-4 py-2 lg:hidden">
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              active
                ? "bg-navy text-white"
                : "text-muted hover:bg-slate-50 hover:text-navy"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
