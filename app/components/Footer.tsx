import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            RANKINGPOST
          </Link>
          <p className="mt-3 max-w-sm text-sm text-slate-300">
            Expert SEO insights, guest posting guides, and digital marketing
            strategies to grow your traffic.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
            Contact Us
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li>
              <span className="text-slate-400">Email: </span>
              <a
                href="mailto:monietcriss@gmail.com"
                className="font-medium text-white transition-colors hover:text-accent"
              >
                monietcriss@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RANKINGPOST. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
