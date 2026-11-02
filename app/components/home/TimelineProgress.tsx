"use client";

import { useEffect, useRef } from "react";

/** Point down the screen (0–1) that the glowing fill follows while scrolling. */
const VIEWPORT_ANCHOR = 0.6;

/**
 * Grey timeline line that fills with gold as the visitor scrolls, with a
 * blinking light at the tip. Steps marked `data-step` light up once the fill
 * passes their `data-step-icon`. Must sit directly inside the timeline list.
 */
export default function TimelineProgress() {
  const trackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const list = track?.parentElement;
    if (!track || !list) return;

    const steps = [...list.querySelectorAll<HTMLElement>("[data-step]")];

    // Browsers already deliver at most one scroll event per frame, so update straight away.
    function update() {
      const rect = list!.getBoundingClientRect();
      const anchor = window.innerHeight * VIEWPORT_ANCHOR;
      const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      track!.style.setProperty("--progress", progress.toFixed(4));
      track!.toggleAttribute("data-moving", progress > 0 && progress < 1);

      const fillEnd = rect.top + rect.height * progress;
      for (const step of steps) {
        const icon = step.querySelector("[data-step-icon]")?.getBoundingClientRect();
        if (icon) step.toggleAttribute("data-active", icon.top + icon.height / 2 <= fillEnd);
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <span
      ref={trackRef}
      aria-hidden="true"
      className="timeline-track absolute bottom-0 left-6 top-0 w-0.5 -translate-x-1/2 md:left-1/2"
    >
      <span className="timeline-fill" />
      <span className="timeline-tip" />
    </span>
  );
}
