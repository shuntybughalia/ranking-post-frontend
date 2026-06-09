import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminMobileNav from "./components/AdminMobileNav";
import AdminSidebar from "./components/AdminSidebar";
import LogoutButton from "./components/LogoutButton";

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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="border-b border-border bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-lg font-bold text-navy lg:hidden">
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
                className="hidden text-sm font-medium text-muted hover:text-navy sm:block"
              >
                View Site
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>
        <AdminMobileNav />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
