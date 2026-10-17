"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { showToast } from "@/lib/toast";

export default function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this article? This cannot be undone.")) return;

    setLoading(true);
    try {
      await apiFetch(`/api/articles/${id}`, { method: "DELETE" });
      showToast("Article deleted.", "success");
      router.refresh();
    } catch {
      // apiFetch already showed the error toast.
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
