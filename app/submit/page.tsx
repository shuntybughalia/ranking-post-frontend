import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import PostForm from "@/app/components/PostForm";
import { ToastProvider } from "@/app/components/Toast";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SubmitPostPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/submit");
  }

  return (
    <ToastProvider>
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">Submit Post</h1>
          <p className="mt-1 text-sm text-muted">
            Create a new blog post with SEO metadata and rich content.
          </p>
        </div>
        <PostForm
          mode="create"
          authorName={session.name}
          userRole={session.role}
        />
      </div>
    </ToastProvider>
  );
}
