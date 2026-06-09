import { getOrders } from "@/lib/orders";
import { getUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage() {
  const [orders, users] = await Promise.all([getOrders(), getUsers()]);
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const sorted = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          {orders.length} total order{orders.length !== 1 ? "s" : ""} placed.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-navy">Package</th>
                  <th className="px-6 py-4 font-semibold text-navy">Customer</th>
                  <th className="px-6 py-4 font-semibold text-navy">Price</th>
                  <th className="px-6 py-4 font-semibold text-navy">Status</th>
                  <th className="px-6 py-4 font-semibold text-navy">Date</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-navy">
                      {order.packageName}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {userMap.get(order.userId) ?? "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-muted">${order.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          statusColors[order.status] ?? "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
