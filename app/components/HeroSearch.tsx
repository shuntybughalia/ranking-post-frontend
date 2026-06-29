"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/blog?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/blog");
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative mx-auto mt-8 max-w-xl">
      <svg
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for articles, guides, or case studies..."
        className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-5 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-accent/50"
      />
    </form>
  );
}
