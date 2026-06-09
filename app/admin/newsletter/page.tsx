import { getSubscribers } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getSubscribers();
  const sorted = [...subscribers].sort(
    (a, b) =>
      new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Newsletter Subscribers</h1>
        <p className="mt-1 text-sm text-muted">
          {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}{" "}
          on your mailing list.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">No subscribers yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-navy">Email</th>
                <th className="px-6 py-4 font-semibold text-navy">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-4 font-medium text-navy">
                    {sub.email}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
