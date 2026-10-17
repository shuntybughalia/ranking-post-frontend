"use client";

import Link from "next/link";
import { useEffect } from "react";
import StatusMessage, {
  primaryButton,
  secondaryButton,
} from "@/app/components/ui/StatusMessage";
import { showToast } from "@/lib/toast";

export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    showToast("We couldn't load this page. Please try again.", "error");
  }, [error]);

  return (
    <StatusMessage
      title="Something went wrong"
      description="This page failed to load. The rest of the site is still working, so try again or head back home."
    >
      <button type="button" onClick={() => unstable_retry()} className={primaryButton}>
        Try again
      </button>
      <Link href="/" className={secondaryButton}>
        Go to homepage
      </Link>
    </StatusMessage>
  );
}
