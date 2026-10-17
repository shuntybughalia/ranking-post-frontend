import { siteContainer as blogContainer } from "@/app/components/layout/siteContainer";

export default function BlogListingSkeleton() {
  return (
    <section className="border-t-[0.8px] border-[#d2d2d2] bg-cream py-12">
      <div className={blogContainer}>
        <div className="mb-12 flex items-start justify-between">
          <div className="h-[30px] w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-[34px] w-[97px] animate-pulse rounded-[4px] bg-slate-200" />
        </div>
        <div className="-mx-3 flex flex-wrap justify-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="w-full px-3 md:w-1/2 min-[62rem]:w-1/3 min-[75rem]:w-1/4"
            >
              <div className="mb-[30px] overflow-hidden rounded-[6px] bg-white">
                <div className="h-[200px] animate-pulse bg-slate-200" />
                <div className="space-y-3 rounded-b-[6px] border-[0.8px] border-[#d8d8d8] px-4 py-3">
                  <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-16 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
