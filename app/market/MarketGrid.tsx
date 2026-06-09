"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MarketPackage } from "@/lib/types";

interface MarketGridProps {
  packages: MarketPackage[];
}

export default function MarketGrid({ packages }: MarketGridProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleOrder(pkg: MarketPackage) {
    setError("");
    setSuccess("");
    setLoadingId(pkg.id);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?redirect=/market`);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Failed to place order.");
        return;
      }

      setSuccess(`Order placed for ${pkg.name}! View it in your orders.`);
      router.push("/orders");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-navy">{pkg.name}</h2>
              <span className="text-2xl font-bold text-navy">${pkg.price}</span>
            </div>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
              {pkg.description}
            </p>
            <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-muted">Domain Authority</span>
                <p className="font-semibold text-navy">DA {pkg.da}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-muted">Traffic</span>
                <p className="font-semibold text-navy">{pkg.traffic}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-muted">Niche</span>
                <p className="font-semibold text-navy">{pkg.niche}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-muted">Turnaround</span>
                <p className="font-semibold text-navy">{pkg.turnaround}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOrder(pkg)}
              disabled={loadingId === pkg.id}
              className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loadingId === pkg.id ? "Placing order..." : "Order Now"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
