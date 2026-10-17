"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ApiError } from "@/lib/api-client";
import {
  dismissToast,
  getToasts,
  showToast,
  subscribeToasts,
  type ToastItem,
} from "@/lib/toast";

const EMPTY: ToastItem[] = [];

const toneClasses: Record<ToastItem["type"], string> = {
  success: "bg-gold text-ink",
  error: "bg-red-600 text-white",
  info: "bg-ink text-white",
};

/** Mounted once in the root layout; renders toasts raised anywhere in the app. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, () => EMPTY);

  useEffect(() => {
    // Last line of defence: surface errors nobody caught instead of failing silently.
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      // apiFetch has already shown its own toast.
      if (reason instanceof ApiError) return;
      showToast("Something went wrong. Please try again.", "error");
    }

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toneClasses[toast.type]}`}
        >
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="-mr-1 text-white/80 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
