import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-navy">
              RANKINGPOST
            </Link>
            <span className="text-sm text-muted">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:block">
              {session.name}
            </span>
            <Link
              href="/admin/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy hover:opacity-90"
            >
              New Article
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-muted hover:text-navy"
            >
              View Site
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
