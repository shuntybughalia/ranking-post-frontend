import { getPendingArticles } from "@/lib/articles";
import ModerationQueue from "../components/ModerationQueue";
import { ToastProvider } from "@/app/components/Toast";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const articles = await getPendingArticles();

  return (
    <ToastProvider>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">Moderation Queue</h1>
          <p className="mt-1 text-sm text-muted">
            Approve or reject user-submitted posts before they go live.
          </p>
        </div>
        <ModerationQueue articles={articles} />
      </div>
    </ToastProvider>
  );
}
