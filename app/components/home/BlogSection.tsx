import type { ArticleListItem } from "@/app/data/articles";
import LatestArticles from "@/app/components/home/LatestArticles";

export default function BlogSection({ latest }: { latest: ArticleListItem[] }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      {latest.length === 0 ? (
        <p className="py-16 text-center text-muted">No articles published yet.</p>
      ) : (
        <LatestArticles articles={latest} />
      )}
    </main>
  );
}
