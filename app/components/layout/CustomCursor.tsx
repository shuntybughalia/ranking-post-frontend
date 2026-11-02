"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], summary, label[for], select, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], input[type="file"]';
const TEXT_FIELD =
  'input:not([type="checkbox"], [type="radio"], [type="file"], [type="submit"], [type="button"], [type="range"], [type="color"]), textarea, [contenteditable="true"]';

/** How far the ring closes the gap to the pointer each frame (0–1); lower trails more. */
const RING_EASE = 0.2;

/**
 * Gold dot on the pointer plus a glowing ring that trails it and grows over
 * clickable things. Only on mouse/trackpad devices without reduced motion;
 * everyone else keeps the CSS brand cursor.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!query.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const pointer = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let frame = 0;

    function render() {
      ringPos.x += (pointer.x - ringPos.x) * RING_EASE;
      ringPos.y += (pointer.y - ringPos.y) * RING_EASE;
      ring!.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      // Stop the loop once the ring has caught up; the next move restarts it.
      if (Math.abs(pointer.x - ringPos.x) > 0.1 || Math.abs(pointer.y - ringPos.y) > 0.1) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    }

    function setState(name: string, on: boolean) {
      root.classList.toggle(name, on);
    }

    function handleMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      dot!.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
      setState("cursor-visible", true);

      const target = event.target instanceof Element ? event.target : null;
      setState("cursor-text", Boolean(target?.closest(TEXT_FIELD)));
      setState("cursor-hover", Boolean(target?.closest(INTERACTIVE)));

      if (!frame) frame = requestAnimationFrame(render);
    }

    const handleDown = () => setState("cursor-pressed", true);
    const handleUp = () => setState("cursor-pressed", false);
    const handleLeave = () => setState("cursor-visible", false);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointerleave", handleLeave);
      root.classList.remove(
        "has-custom-cursor",
        "cursor-visible",
        "cursor-text",
        "cursor-hover",
        "cursor-pressed",
      );
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="cursor-ring">
        <span />
      </div>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot">
        <span />
      </div>
    </>
  );
}
