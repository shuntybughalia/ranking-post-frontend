import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";

export default async function SuperAdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isSuperAdmin(session.role)) {
    redirect("/admin");
  }

  return children;
}
