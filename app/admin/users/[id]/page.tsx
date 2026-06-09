import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesByAuthor } from "@/lib/articles";
import { getOrdersByUser } from "@/lib/orders";
import { roleLabel } from "@/lib/permissions";
import { getUserById, toPublicUser } from "@/lib/users";
import UserRoleSelect from "../../components/UserRoleSelect";
import DeleteUserButton from "../../components/DeleteUserButton";

export const dynamic = "force-dynamic";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const userRecord = await getUserById(id);

  if (!userRecord) notFound();

  const user = toPublicUser(userRecord);
  const [orders, articles] = await Promise.all([
    getOrdersByUser(id),
    getArticlesByAuthor(user.name),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-navy"
      >
        ← Back to users
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{user.name}</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                user.role === "super_admin"
                  ? "bg-purple-100 text-purple-800"
                  : user.role === "admin"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {roleLabel(user.role)}
            </span>
            <span className="text-xs text-muted">
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UserRoleSelect userId={user.id} currentRole={user.role} />
          <DeleteUserButton userId={user.id} userName={user.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-navy">
            Orders ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders placed.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {order.packageName}
                    </p>
                    <p className="text-xs capitalize text-muted">
                      {order.status.replace("_", " ")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-navy">
                    ${order.price}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-navy">
            Articles ({articles.length})
          </h2>
          {articles.length === 0 ? (
            <p className="text-sm text-muted">No articles published.</p>
          ) : (
            <ul className="space-y-3">
              {articles.map((article) => (
                <li
                  key={article.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-sm font-medium text-navy hover:underline"
                    target="_blank"
                  >
                    {article.title}
                  </Link>
                  <span className="text-xs text-muted">{article.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
