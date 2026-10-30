"use client";

import { useState } from "react";

interface StarPickerProps {
  value: number;
  onChange: (rating: number) => void;
}

/** Clickable 1–5 star rating input. */
export default function StarPicker({ value, onChange }: StarPickerProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className="text-gold transition-transform hover:scale-110"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= shown ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
