"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import { apiFetch } from "@/lib/api-client";

export default function DeleteMessageButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await apiFetch(`/api/contact/${id}`, { method: "DELETE" });
      setConfirming(false);
      router.refresh();
    } catch {
      // apiFetch already showed the error toast.
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-red-600"
      >
        Delete
      </button>
      <ConfirmModal
        open={confirming}
        title="Delete message"
        message="This message will be permanently removed."
        loading={loading}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
