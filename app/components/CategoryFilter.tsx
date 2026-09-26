"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories, type Category } from "../data/articles";

interface CategoryFilterProps {
  active: Category;
}

export default function CategoryFilter({ active }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(category: Category) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "All Posts") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <section className="border-b border-border bg-slate-50 px-6 py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handleChange(category)}
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
