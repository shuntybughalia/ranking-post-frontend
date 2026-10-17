"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { showToast } from "@/lib/toast";
import type { UserRole } from "@/lib/types";

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
}

export default function UserRoleSelect({
  userId,
  currentRole,
}: UserRoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  async function handleChange(newRole: UserRole) {
    if (newRole === role) return;

    setLoading(true);
    try {
      await apiFetch(`/api/users/${userId}`, { method: "PATCH", json: { role: newRole } });
      setRole(newRole);
      showToast("Role updated.", "success");
      router.refresh();
    } catch {
      // apiFetch already showed the error toast.
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs text-navy outline-none disabled:opacity-60"
      title="Change user role"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
      <option value="super_admin">Super Admin</option>
    </select>
  );
}
