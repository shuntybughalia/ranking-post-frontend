"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiFetch, getErrorMessage } from "@/lib/api-client";
import { showToast } from "@/lib/toast";
import type { Order } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ orders?: Order[] }>("/api/orders", { toastOnError: false })
      .then((data) => setOrders(data.orders ?? []))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.push("/login?redirect=/orders");
          return;
        }
        showToast(getErrorMessage(error), "error");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this order?")) return;
    setCancellingId(id);

    try {
      const data = await apiFetch<{ order: Order }>(`/api/orders/${id}`, {
        method: "PATCH",
        json: { status: "cancelled" },
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      showToast("Order cancelled.", "success");
    } catch {
      // apiFetch already showed the error toast.
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-muted">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/market"
            className="mt-4 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink hover:opacity-90"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-semibold text-navy">{order.packageName}</h2>
                <p className="mt-1 text-sm text-muted">
                  Ordered{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-navy">
                  ${order.price}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    statusColors[order.status] ?? "bg-slate-100"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
                {order.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {cancellingId === order.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
