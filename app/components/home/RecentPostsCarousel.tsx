"use client";

import Link from "next/link";
import { PointerEvent, TransitionEvent, useCallback, useEffect, useRef, useState } from "react";
import PostImage from "@/app/components/blog/PostImage";
import type { ArticleListItem } from "@/app/data/articles";

const AUTOPLAY_MS = 2000;
/** Matches the track's duration-700 class. */
const SLIDE_TRANSITION_MS = 700;
const SWIPE_THRESHOLD_PX = 50;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Home page slider of the newest posts; auto-advances unless hovered, focused, or reduced motion is on.
 * The track is [last, ...slides, first]: moving past either end lands on a copy, then jumps to the
 * real slide without animation, so 5 → 1 keeps sliding forward instead of rewinding.
 */
export default function RecentPostsCarousel({ articles }: { articles: ArticleListItem[] }) {
  const count = articles.length;
  const looping = count > 1;
  // Position in the track; 0 and count + 1 are the copies.
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const index = looping ? (pos - 1 + count) % count : 0;

  const move = useCallback(
    (step: number) => {
      setAnimate(true);
      setPos((p) =>
        // No transition runs with reduced motion, so wrap directly instead of using the copies.
        prefersReducedMotion()
          ? ((p - 1 + step + count) % count) + 1
          : Math.min(Math.max(p + step, 0), count + 1),
      );
    },
    [count],
  );

  function goTo(slide: number) {
    setAnimate(true);
    setPos(slide + 1);
  }

  /** Jumps (unanimated) from a copy at either end to the real slide it shows. */
  const snapOffCopy = useCallback(() => {
    setPos((p) => {
      if (p !== 0 && p !== count + 1) return p;
      setAnimate(false);
      return p === 0 ? count : 1;
    });
  }, [count]);

  // Backup for when no transitionend arrives (e.g. a background tab skips the animation).
  useEffect(() => {
    if (pos !== 0 && pos !== count + 1) return;
    const timer = window.setTimeout(snapOffCopy, SLIDE_TRANSITION_MS + 150);
    return () => window.clearTimeout(timer);
  }, [pos, count, snapOffCopy]);

  useEffect(() => {
    if (paused || !looping || prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) move(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, looping, move]);

  // After the instant jump off a copy has painted, turn the slide animation back on.
  useEffect(() => {
    if (animate) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animate]);

  if (count === 0) return null;

  const track = looping ? [articles[count - 1], ...articles, articles[0]] : articles;

  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    // Ignore transitions bubbling up from links and buttons inside the slides.
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    snapOffCopy();
  }

  function handlePointerUp(e: PointerEvent) {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    move(delta < 0 ? 1 : -1);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Recent posts"
      className="recent-posts-backdrop relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={`flex touch-pan-y ${
          animate ? "transition-transform duration-700 ease-out motion-reduce:transition-none" : ""
        }`}
        style={{ transform: `translateX(-${(looping ? pos : 0) * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
        onPointerDown={(e) => {
          pointerStartX.current = e.clientX;
        }}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        {track.map((article, t) => {
          const isCopy = looping && (t === 0 || t === count + 1);
          const slide = looping ? (t - 1 + count) % count : t;
          const isActive = !isCopy && slide === index;

          return (
            <div
              key={isCopy ? `${article.id}-copy-${t}` : article.id}
              role={isCopy ? undefined : "group"}
              aria-roledescription={isCopy ? undefined : "slide"}
              aria-label={isCopy ? undefined : `${slide + 1} of ${count}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className="w-full min-w-0 shrink-0"
            >
              <div className="mx-auto grid h-full max-w-7xl items-center gap-6 px-6 pb-14 pt-8 md:min-h-[480px] md:grid-cols-2 md:gap-8 md:px-16">
                <div className="min-w-0">
                  <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-light">
                    {article.category}
                  </span>
                  <h2 className="mt-4 break-words text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
                    <Link href={`/blog/${article.slug}`} className="no-underline">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-200 md:line-clamp-3 md:text-base">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-linear-to-r from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
                  >
                    Read more
                    <ArrowIcon direction="right" />
                  </Link>
                </div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gold/10 ring-1 ring-gold/25 shadow-xl shadow-black/35">
                  <PostImage
                    src={article.image}
                    alt=""
                    sizes="(min-width: 1280px) 560px, (min-width: 768px) 50vw, 100vw"
                    preload={!isCopy && slide === 0}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {looping && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous post"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-gold/30 bg-white p-2.5 text-gold-dark transition-colors hover:bg-gold/20 md:block"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next post"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-gold/30 bg-white p-2.5 text-gold-dark transition-colors hover:bg-gold/20 md:block"
          >
            <ArrowIcon direction="right" />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {articles.map((article, i) => (
              <button
                key={article.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show post ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-accent" : "w-2.5 bg-white/45 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
