"use client";

import { useState } from "react";

export default function SocialShare({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "fallback">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("fallback");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-gold-dark"
      >
        Copy link
      </button>
      <span role="status" className="text-xs text-muted">
        {status === "copied" && "Link copied"}
        {status === "fallback" && "Select and copy the link below."}
      </span>
      {status === "fallback" && (
        <input
          aria-label="Live article URL"
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
