"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { PostNotification, SessionUser } from "@/lib/types";
import { useDismiss } from "./useDismiss";

const SEEN_KEY = "rankingpost-notifications-seen";

const MESSAGES: Record<string, { text: string; dot: string }> = {
  published: { text: "was published", dot: "bg-emerald-500" },
  pending: { text: "is waiting for review", dot: "bg-amber-500" },
  rejected: { text: "was not approved", dot: "bg-red-500" },
};

function readSeenAt(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Bell with review updates on the user's posts; the dot marks updates since the menu was last opened. */
export default function NotificationsMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PostNotification[] | null>(null);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiFetch<{ notifications: PostNotification[] }>("/api/notifications", { toastOnError: false })
      .then((data) => {
        if (cancelled) return;
        setItems(data.notifications);
        setSeenAt(readSeenAt());
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const unread = user
    ? (items ?? []).filter((item) => item.status !== "pending" && new Date(item.at).getTime() > seenAt).length
    : 0;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && user) {
      const now = Date.now();
      setSeenAt(now);
      try {
        localStorage.setItem(SEEN_KEY, String(now));
      } catch {
        // Storage can be unavailable (private mode); the dot just won't persist.
      }
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unread ? `Notifications (${unread} new)` : "Notifications"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#30384e] transition-colors hover:bg-slate-100 hover:text-gold-dark"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border bg-white shadow-xl"
        >
          <p className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">Notifications</p>
          {!user ? (
            <div className="px-4 py-6 text-center text-sm text-muted">
              <Link href="/login" onClick={close} className="font-semibold text-gold-dark hover:underline">
                Sign in
              </Link>{" "}
              to see updates on your posts.
            </div>
          ) : items === null ? (
            <p className="px-4 py-6 text-center text-sm text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No notifications yet. Updates on your submitted posts will show here.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto">
              {items.map((item) => {
                const message = MESSAGES[item.status] ?? MESSAGES.pending;
                return (
                  <li key={item.id}>
                    <Link
                      role="menuitem"
                      href={item.status === "published" ? `/blog/${item.slug}` : `/my-posts/${item.id}/edit`}
                      onClick={close}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${message.dot}`} />
                      <span className="min-w-0 text-sm">
                        <span className="text-ink">
                          <span className="font-semibold">{item.title}</span> {message.text}
                        </span>
                        {item.status === "rejected" && item.rejectionReason && (
                          <span className="mt-0.5 block text-xs text-red-600">{item.rejectionReason}</span>
                        )}
                        <span className="mt-0.5 block text-xs text-muted">{timeAgo(item.at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
