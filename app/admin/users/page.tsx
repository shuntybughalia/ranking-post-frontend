import Link from "next/link";
import { getUsers, toPublicUser } from "@/lib/users";
import { roleLabel } from "@/lib/permissions";
import UserRoleSelect from "../components/UserRoleSelect";
import DeleteUserButton from "../components/DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = (await getUsers()).map(toPublicUser).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">All Users</h1>
        <p className="mt-1 text-sm text-muted">
          Super admin view — manage every registered account on RANKINGPOST.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users", value: users.length },
          {
            label: "Admins",
            value: users.filter((u) => u.role === "admin").length,
          },
          {
            label: "Super Admins",
            value: users.filter((u) => u.role === "super_admin").length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">No users registered yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-border bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-navy">Name</th>
                  <th className="px-6 py-4 font-semibold text-navy">Email</th>
                  <th className="px-6 py-4 font-semibold text-navy">Role</th>
                  <th className="px-6 py-4 font-semibold text-navy">Joined</th>
                  <th className="px-6 py-4 font-semibold text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-navy hover:underline"
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "super_admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserRoleSelect userId={user.id} currentRole={user.role} />
                        <DeleteUserButton userId={user.id} userName={user.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
