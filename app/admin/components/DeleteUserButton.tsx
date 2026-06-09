"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error ?? "Failed to delete user.");
        return;
      }

      router.push("/admin/users");
      router.refresh();
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
