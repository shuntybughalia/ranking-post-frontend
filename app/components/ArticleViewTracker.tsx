"use client";

import { useEffect, useRef } from "react";

interface ArticleViewTrackerProps {
  articleId: string;
}

export default function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch(`/api/articles/${articleId}/view`, { method: "POST" }).catch(() => {});
  }, [articleId]);

  return null;
}
