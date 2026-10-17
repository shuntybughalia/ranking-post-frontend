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
}

/**
 * Fills its (relatively positioned) parent. Known hosts go through the image
 * optimizer; if optimizing fails (unknown host, DNS/IP rules, upstream error)
 * it falls back to loading the original URL so a post never shows a broken image.
 */
export default function PostImage({
  src,
  alt,
  sizes,
  preload = false,
  className = "object-cover",
}: PostImageProps) {
  const [optimizerFailed, setOptimizerFailed] = useState(false);
  const optimize = isOptimizableImage(src) && !optimizerFailed;

  return (
    <Image
      key={optimize ? "optimized" : "direct"}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      unoptimized={!optimize}
      onError={optimize ? () => setOptimizerFailed(true) : undefined}
      className={className}
    />
  );
}
