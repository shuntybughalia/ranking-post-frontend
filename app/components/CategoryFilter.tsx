"use client";

import { categories, type Category } from "../data/articles";

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <section className="border-b border-border bg-slate-50 px-6 py-5">
      <div className="mx-auto max-w-6xl overflow-x-auto pb-1">
        <div className="flex min-w-max flex-wrap items-center gap-2 md:min-w-0">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                active === category
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-muted hover:border-slate-300 hover:text-navy"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
