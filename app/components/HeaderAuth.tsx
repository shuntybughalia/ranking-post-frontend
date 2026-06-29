"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { UserRole } from "@/lib/types";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function HeaderAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/me", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const canAdmin =
    user?.role === "admin" || user?.role === "super_admin";

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/my-posts"
          className="hidden text-sm font-medium text-muted transition-colors hover:text-navy sm:block"
        >
          My Posts
        </Link>
        {canAdmin && (
          <Link
            href="/admin"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-navy sm:block"
          >
            Admin Panel
          </Link>
        )}
        <span className="hidden text-sm text-muted sm:block">{user.name}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="hidden text-sm font-medium text-muted transition-colors hover:text-navy sm:block"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
      >
        Register
      </Link>
    </div>
  );
}
