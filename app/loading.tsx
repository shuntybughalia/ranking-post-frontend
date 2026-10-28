/** Shown instantly while any page without its own loading state renders on the server. */
export default function Loading() {
  return (
    <div className="flex-1 bg-background" role="status" aria-label="Loading page">
      <div className="mx-auto w-full max-w-6xl animate-pulse px-6 py-10">
        <div className="h-56 rounded-2xl bg-slate-200/70 md:h-72" />
        <div className="mt-10 h-7 w-1/3 rounded bg-slate-200/70" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-4">
              <div className="h-36 rounded-lg bg-slate-200/70" />
              <div className="mt-4 h-4 w-4/5 rounded bg-slate-200/70" />
              <div className="mt-2 h-4 w-3/5 rounded bg-slate-200/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
