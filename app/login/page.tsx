"use client";

import Link from "next/link";
import Header from "../components/Header";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
            <p className="mt-2 text-sm text-muted">
              Log in to your RANKINGPOST account.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
              >
                Log in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-navy hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
