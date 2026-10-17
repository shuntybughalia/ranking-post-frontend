"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { showToast } from "@/lib/toast";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export default function DeleteUserButton({
  userId,
  userName,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete user "${userName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      showToast("User deleted.", "success");
      router.push("/admin/users");
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
      className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
