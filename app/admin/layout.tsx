import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canAccessAdmin, isSuperAdmin, roleLabel } from "@/lib/permissions";
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

  if (!canAccessAdmin(session.role)) {
    redirect("/?error=admin_access_denied");
  }

  const superAdmin = isSuperAdmin(session.role);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar isSuperAdmin={superAdmin} />
      <div className="flex flex-1 flex-col">
        <header className="border-b border-border bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-lg font-bold text-navy lg:hidden">
                RANKINGPOST
              </Link>
              <span className="text-sm text-muted">Admin Panel</span>
              {superAdmin && (
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  Super Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-muted sm:block">
                {session.name}
                <span className="ml-1 text-xs">({roleLabel(session.role)})</span>
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
        <AdminMobileNav isSuperAdmin={superAdmin} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
