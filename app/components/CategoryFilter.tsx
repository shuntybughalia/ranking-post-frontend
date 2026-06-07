"use client";

import { useState } from "react";
import { categories, type Category } from "../data/articles";

export default function CategoryFilter() {
  const [active, setActive] = useState<Category>("All Posts");

  return (
    <section className="border-b border-border bg-slate-50 px-6 py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "bg-navy text-white"
                : "border border-border bg-white text-muted hover:border-slate-300 hover:text-navy"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}
