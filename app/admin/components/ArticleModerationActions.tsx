"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostStatus } from "@/lib/types";

interface ArticleModerationActionsProps {
  id: string;
  status: PostStatus;
}

export default function ArticleModerationActions({
  id,
  status,
}: ArticleModerationActionsProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  if (status === "published") {
    return null;
  }

  async function handleApprove() {
    const label = status === "draft" ? "Publish this draft?" : "Approve this post?";
    if (!confirm(label)) return;

    setApproving(true);
    try {
      const res = await fetch(`/api/posts/${id}/approve`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to approve post.");
      }
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    const reason =
      window.prompt("Rejection reason (optional):") ?? "Rejected by admin.";
    if (reason === null) return;

    setRejecting(true);
    try {
      const res = await fetch(`/api/posts/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to reject post.");
      }
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleApprove()}
        disabled={approving || rejecting}
        className="text-sm font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
      >
        {approving ? "Approving..." : status === "draft" ? "Publish" : "Approve"}
      </button>
      {status === "pending" && (
        <button
          type="button"
          onClick={() => void handleReject()}
          disabled={approving || rejecting}
          className="text-sm font-medium text-amber-700 hover:text-amber-800 disabled:opacity-50"
        >
          {rejecting ? "Rejecting..." : "Reject"}
        </button>
      )}
    </>
  );
}
