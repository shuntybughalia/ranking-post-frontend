"use client";

import Image from "next/image";
import { useState } from "react";
import { isOptimizableImage } from "@/lib/image-hosts";

interface PostImageProps {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  /** Keep the image's own aspect ratio instead of filling the parent. */
  natural?: boolean;
}

/**
 * Fills its (relatively positioned) parent, or with `natural` sizes itself to the
 * image's own aspect ratio. Known hosts go through the image optimizer; if
 * optimizing fails (unknown host, DNS/IP rules, upstream error) it falls back to
 * loading the original URL so a post never shows a broken image.
 */
export default function PostImage({
  src,
  alt,
  sizes,
  preload = false,
  className = "object-cover",
  natural = false,
}: PostImageProps) {
  const [optimizerFailed, setOptimizerFailed] = useState(false);
  const optimize = isOptimizableImage(src) && !optimizerFailed;

  return (
    <Image
      key={optimize ? "optimized" : "direct"}
      src={src}
      alt={alt}
      // Real dimensions are unknown up front; with `h-auto` the browser switches to the
      // image's true aspect ratio once it loads (16:9 only reserves space until then).
      {...(natural ? { width: 1600, height: 900 } : { fill: true })}
      sizes={sizes}
      preload={preload}
      unoptimized={!optimize}
      onError={optimize ? () => setOptimizerFailed(true) : undefined}
      className={className}
    />
  );
}
