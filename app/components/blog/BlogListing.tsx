import Link from "next/link";
import {
  categories,
  filterArticles,
  filterArticlesByQuery,
  type ArticleListItem,
  type Category,
} from "@/app/data/articles";
import { siteContainer as blogContainer } from "@/app/components/layout/siteContainer";
import BlogGridCard from "@/app/components/blog/BlogGridCard";

export { blogContainer };

const RECENT_LIMIT = 8;
const CATEGORY_LIMIT = 4;

interface BlogListingProps {
  articles: ArticleListItem[];
  activeCategory: Category;
  searchQuery: string;
  showAllRecent: boolean;
}

interface SectionProps {
  title: string;
  articles: ArticleListItem[];
  viewMoreHref?: string;
  className: string;
}

function BlogGridSection({ title, articles, viewMoreHref, className }: SectionProps) {
  return (
    <section className={`relative py-12 ${className}`}>
      <div className={blogContainer}>
        <div className="flex items-start justify-between">
          <div className="mb-12 w-2/3">
            <h2 className="mb-2 text-[24px] font-semibold leading-[30px] text-gold-dark">
              {title}
            </h2>
          </div>
          {viewMoreHref && (
            <div className="mt-2 flex w-1/3 justify-end">
              <Link
                href={viewMoreHref}
                className="me-1 inline-flex rounded-[4px] border-[0.8px] border-gold bg-white px-[15px] py-[10px] text-[13px] font-medium leading-[19.5px] tracking-[0.5px] text-gold-dark transition-colors hover:bg-gold hover:text-ink"
              >
                View More
              </Link>
            </div>
          )}
        </div>

        <div className="-mx-3 flex flex-wrap justify-center">
          {articles.map((article) => (
            <div
              key={article.id}
              className="w-full px-3 md:w-1/2 min-[62rem]:w-1/3 min-[75rem]:w-1/4"
            >
              <BlogGridCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurCategories({ articles }: { articles: ArticleListItem[] }) {
  const groups = categories
    .map((category) => ({
      category,
      posts: articles.filter((article) => article.category === category).slice(0, 12),
    }))
    .filter((group) => group.posts.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="relative bg-ink py-10">
      <div className={blogContainer}>
        <h2 className="mb-4 text-[24px] font-semibold leading-[30px] text-[#f8f9fa]">
          Our Categories
        </h2>
        {groups.map(({ category, posts }) => (
          <p key={category} className="mb-4 text-justify text-[14px] leading-[24px] text-[#d9d2c2]">
            <Link
              href={`/blog?category=${encodeURIComponent(category)}`}
              className="mr-1 font-bold text-white hover:text-gold"
            >
              {category}:
            </Link>
            {posts.map((post, index) => (
              <span key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-[#d9d2c2] transition-colors hover:text-gold"
                >
                  {post.title}
                </Link>
                {index < posts.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}

const alternatingBackgrounds = ["bg-[#f6f7f8]", "bg-white"];

export default function BlogListing({
  articles,
  activeCategory,
  searchQuery,
  showAllRecent,
}: BlogListingProps) {
  const isFiltered = activeCategory !== "All Posts" || searchQuery !== "" || showAllRecent;
  const firstSection = "border-t-[0.8px] border-[#d2d2d2] bg-cream";

  if (isFiltered) {
    const filtered = filterArticlesByQuery(
      filterArticles(activeCategory, articles),
      searchQuery,
    );
    const title = searchQuery
      ? `Search results for "${searchQuery}"`
      : activeCategory !== "All Posts"
        ? activeCategory
        : "Recent Blog Posts";

    return (
      <>
        {filtered.length === 0 ? (
          <section className={`py-12 ${firstSection}`}>
            <div className={blogContainer}>
              <h2 className="mb-2 text-[24px] font-semibold leading-[30px] text-gold-dark">
                {title}
              </h2>
              <p className="py-16 text-center text-[14px] text-[#333]">
                {searchQuery
                  ? `No articles found for "${searchQuery}".`
                  : "No articles found in this category."}
              </p>
            </div>
          </section>
        ) : (
          <BlogGridSection title={title} articles={filtered} className={firstSection} />
        )}
        <OurCategories articles={articles} />
      </>
    );
  }

  const categorySections = categories
    .map((category) => ({
      category,
      posts: articles.filter((article) => article.category === category),
    }))
    .filter((section) => section.posts.length > 0);

  return (
    <>
      <BlogGridSection
        title="Recent Blog Posts"
        articles={articles.slice(0, RECENT_LIMIT)}
        viewMoreHref="/blog?view=all"
        className={firstSection}
      />
      {categorySections.map(({ category, posts }, index) => (
        <BlogGridSection
          key={category}
          title={category}
          articles={posts.slice(0, CATEGORY_LIMIT)}
          viewMoreHref={`/blog?category=${encodeURIComponent(category)}`}
          className={alternatingBackgrounds[index % alternatingBackgrounds.length]}
        />
      ))}
      <OurCategories articles={articles} />
    </>
  );
}
