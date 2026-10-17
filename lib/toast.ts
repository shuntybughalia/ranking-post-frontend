/**
 * Framework-free toast store so any client code (components, fetch helpers,
 * global error listeners) can raise a toast. Rendered by <Toaster />.
 */

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const TOAST_DURATION_MS = 4500;
const MAX_TOASTS = 4;

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts() {
  return toasts;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function showToast(message: string, type: ToastType = "info") {
  // Collapse repeats of the same message (e.g. several failing requests at once).
  if (toasts.some((toast) => toast.message === message && toast.type === type)) {
    return;
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, message, type }].slice(-MAX_TOASTS);
  emit();

  if (typeof window !== "undefined") {
    window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
  }
}
