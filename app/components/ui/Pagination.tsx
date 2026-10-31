import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  label?: string;
}

const itemBase =
  "flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors";
const linkItem = `${itemBase} border border-border bg-white text-navy hover:border-gold hover:text-gold-dark`;
const disabledItem = `${itemBase} border border-border bg-white text-slate-400`;

/** Page numbers to show: first, last and the current page's neighbours, with gaps between. */
function visiblePages(page: number, totalPages: number): (number | "gap")[] {
  const wanted = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const pages: (number | "gap")[] = [];
  wanted.forEach((value, index) => {
    const previous = wanted[index - 1];
    if (previous !== undefined) {
      // A gap of one page is just shown; a dot would take the same space.
      if (value - previous === 2) pages.push(previous + 1);
      else if (value - previous > 2) pages.push("gap");
    }
    pages.push(value);
  });
  return pages;
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

/** Previous / next with page numbers; phones show a compact "Page 2 of 30" instead. */
export default function Pagination({
  page,
  totalPages,
  hrefForPage,
  label = "Pagination",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className="mt-10 flex items-center justify-between gap-2 sm:justify-center">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} rel="prev" className={`${linkItem} gap-1`}>
          <Arrow direction="left" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${disabledItem} gap-1`}>
          <Arrow direction="left" />
          Previous
        </span>
      )}

      <span className="text-sm font-medium text-muted sm:hidden">
        Page {page} of {totalPages}
      </span>

      <ol className="hidden items-center gap-2 sm:flex">
        {visiblePages(page, totalPages).map((item, index) => (
          <li key={item === "gap" ? `gap-${index}` : item}>
            {item === "gap" ? (
              <span aria-hidden="true" className="px-1 text-muted">
                …
              </span>
            ) : item === page ? (
              <span aria-current="page" className={`${itemBase} bg-gold text-ink`}>
                {item}
              </span>
            ) : (
              <Link href={hrefForPage(item)} aria-label={`Page ${item}`} className={linkItem}>
                {item}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} rel="next" className={`${linkItem} gap-1`}>
          Next
          <Arrow direction="right" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${disabledItem} gap-1`}>
          Next
          <Arrow direction="right" />
        </span>
      )}
    </nav>
  );
}
