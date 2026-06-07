"use client";

import Link from "next/link";
import Header from "../components/Header";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-navy">Create your account</h1>
            <p className="mt-2 text-sm text-muted">
              Join RANKINGPOST to access guest posting tools and SEO insights.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-navy">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
                  Business email
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
                Register
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-navy hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
