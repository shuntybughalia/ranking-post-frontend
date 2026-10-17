"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      // apiFetch already showed the error toast.
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-slate-50 hover:text-navy disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
