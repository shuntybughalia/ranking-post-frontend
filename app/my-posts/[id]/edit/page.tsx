import { notFound, redirect } from "next/navigation";
import Header from "@/app/components/Header";
import PostForm from "@/app/components/PostForm";
import { ToastProvider } from "@/app/components/Toast";
import { getArticleById } from "@/lib/articles";
import { getSession } from "@/lib/auth";
import { canEditPost } from "@/lib/post-auth";

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMyPostPage({ params }: EditPostPageProps) {
  const session = await getSession();

  if (!session) {
    redirect(`/login?redirect=/my-posts`);
  }

  const { id } = await params;
  const article = await getArticleById(id);

  if (!article || !canEditPost(session, article)) {
    notFound();
  }

  return (
    <ToastProvider>
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">Edit Post</h1>
          <p className="mt-1 text-sm text-muted">
            Update your draft or submitted article.
          </p>
        </div>
        <PostForm
          mode="edit"
          article={article}
          authorName={session.name}
          userRole={session.role}
        />
      </div>
    </ToastProvider>
  );
}
