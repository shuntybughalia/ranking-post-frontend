import { siteContainer } from "@/app/components/layout/siteContainer";

/** Article-shaped placeholder while a post renders. */
export default function PostLoading() {
  return (
    <div className="flex-1 bg-white" role="status" aria-label="Loading post">
      <div
        className={`${siteContainer} grid animate-pulse gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12`}
      >
        <div className="min-w-0">
          <div className="h-10 w-11/12 rounded bg-slate-200/70 md:h-12" />
          <div className="mt-3 h-10 w-2/3 rounded bg-slate-200/70 md:h-12" />
          <div className="mt-6 h-4 w-1/2 rounded bg-slate-200/70" />
          <div className="mt-8 aspect-video w-full bg-slate-200/70" />
          <div className="mt-8 space-y-3">
            {["w-full", "w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((width, i) => (
              <div key={i} className={`h-4 rounded bg-slate-200/70 ${width}`} />
            ))}
          </div>
        </div>
        <div className="hidden space-y-4 lg:block">
          <div className="h-48 rounded-lg bg-slate-200/70" />
          <div className="h-64 rounded-lg bg-slate-200/70" />
        </div>
      </div>
    </div>
  );
}
