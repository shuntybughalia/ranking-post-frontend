"use client";

import { FormEvent, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          currentPassword: form.get("currentPassword") || undefined,
          newPassword: form.get("newPassword") || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update profile.");
        return;
      }

      setUser(data.user);
      setSuccess("Profile updated successfully.");
      (e.target as HTMLFormElement).reset();
      const nameInput = document.getElementById("name") as HTMLInputElement;
      if (nameInput) nameInput.value = data.user.name;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account profile and password.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled
            value={user?.email ?? ""}
            className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-muted"
          />
        </div>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-navy">
            Display Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={user?.name}
            key={user?.name}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <hr className="border-border" />

        <p className="text-sm font-medium text-navy">Change Password</p>
        <p className="text-xs text-muted">
          Leave blank to keep your current password.
        </p>

        <div>
          <label
            htmlFor="currentPassword"
            className="mb-1.5 block text-sm font-medium text-navy"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="mb-1.5 block text-sm font-medium text-navy"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={6}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
