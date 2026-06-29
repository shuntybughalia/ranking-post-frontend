export default function BlogListingSkeleton() {
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
        <div className="mb-8">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mb-6 h-11 w-full max-w-md animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
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
