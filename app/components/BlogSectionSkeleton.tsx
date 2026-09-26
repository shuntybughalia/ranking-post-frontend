export default function BlogSectionSkeleton() {
  return (
    <>
      <section className="border-b border-border bg-slate-50 px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-full bg-slate-200"
            />
          ))}
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-20 w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="aspect-[16/10] animate-pulse bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-12 w-full animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
