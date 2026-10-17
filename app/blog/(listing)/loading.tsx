import BlogListingSkeleton from "@/app/components/blog/BlogListingSkeleton";

export default function BlogLoading() {
  return (
    <div className="flex-1 bg-white">
      <div className="h-[54px] border-b-[0.8px] border-[#e9e9e9] bg-white" />
      <BlogListingSkeleton />
    </div>
  );
}
