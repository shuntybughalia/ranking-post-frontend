"use client";

import { Poppins } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "600"] });

/** Replaces the root layout when it fails, so it must render its own <html>/<body>. */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={poppins.variable}>
      <body className="flex min-h-screen items-center justify-center bg-cream px-4">
        <title>Something went wrong — RANKINGPOST</title>
        <div className="max-w-md text-center">
          <h1 className="text-[24px] font-semibold text-gold-dark">Something went wrong</h1>
          <p className="mt-3 text-[14px] text-[#2a2a2b]">
            We hit an unexpected problem. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 rounded-[4px] bg-gold px-[15px] py-[10px] text-[13px] font-medium text-ink hover:bg-gold-light"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
