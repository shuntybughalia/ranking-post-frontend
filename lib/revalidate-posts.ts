import { revalidatePath } from "next/cache";
import type { Article } from "./types";

export function revalidatePostPaths(article?: Pick<Article, "slug"> | null) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/my-posts");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/moderation");

  if (article?.slug) {
    revalidatePath(`/blog/${article.slug}`);
  }
}
