"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "loading" | "done";

/** Thin gold bar at the top that starts the moment an internal link is clicked. */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const safetyTimer = useRef<number | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (or just a #hash jump): nothing will load.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setPhase("loading");
      if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
      safetyTimer.current = window.setTimeout(() => setPhase("idle"), 10_000);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // The URL changed, so the new page is on screen (or showing its loading skeleton).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- finishing the bar is a reaction to navigation
    setPhase((current) => (current === "loading" ? "done" : current));
    const timer = window.setTimeout(() => setPhase("idle"), 300);
    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div
        className={`h-full bg-gold shadow-[0_0_8px_var(--gold)] ${
          phase === "loading"
            ? "w-[85%] opacity-100 transition-[width] duration-[8000ms] ease-out"
            : phase === "done"
              ? "w-full opacity-0 transition-[width,opacity] duration-300"
              : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
