"use client";

import type { PostStats } from "@/lib/types";

interface PostStatsCardsProps {
  stats: PostStats;
}

export default function PostStatsCards({ stats }: PostStatsCardsProps) {
  const cards = [
    { label: "Total Posts", value: stats.total },
    { label: "Published", value: stats.published },
    { label: "Drafts", value: stats.draft },
    { label: "Views", value: stats.views },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-navy">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
