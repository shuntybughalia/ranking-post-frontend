"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import UserAvatar from "@/app/components/ui/UserAvatar";
import type { SessionUser } from "@/lib/types";
import { useDismiss } from "./useDismiss";

interface UserMenuProps {
  user: SessionUser | null;
  loading: boolean;
  onLogout: () => void;
}

const itemClass =
  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#30384e] transition-colors hover:bg-slate-50 hover:text-gold-dark";

function MenuIcon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-muted">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  profile: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  submit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  posts: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8",
  admin: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  signOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  signIn: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
  signUp: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6",
};

/** Avatar button with the account menu: sign in / sign up, or profile links and sign out. */
export default function UserMenu({ user, loading, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (loading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />;
  }

  const canAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? `Account menu for ${user.name}` : "Account menu"}
        className="rounded-full ring-offset-2 transition-shadow hover:ring-2 hover:ring-gold focus-visible:ring-2 focus-visible:ring-gold"
      >
        <UserAvatar gender={user?.gender} src={user?.avatarUrl} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-white py-2 shadow-xl"
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-1">
                <UserAvatar gender={user.gender} src={user.avatarUrl} className="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <div className="py-1">
                <Link role="menuitem" href="/profile" onClick={close} className={itemClass}>
                  <MenuIcon path={ICONS.profile} /> Profile
                </Link>
                <Link role="menuitem" href="/settings" onClick={close} className={itemClass}>
                  <MenuIcon path={ICONS.settings} /> Settings
                </Link>
                <Link role="menuitem" href="/submit" onClick={close} className={itemClass}>
                  <MenuIcon path={ICONS.submit} /> Submit Post
                </Link>
                <Link role="menuitem" href="/my-posts" onClick={close} className={itemClass}>
                  <MenuIcon path={ICONS.posts} /> My Posts
                </Link>
                {canAdmin && (
                  <Link role="menuitem" href="/admin" onClick={close} className={itemClass}>
                    <MenuIcon path={ICONS.admin} /> Admin Panel
                  </Link>
                )}
              </div>
              <div className="border-t border-border pt-1">
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    close();
                    onLogout();
                  }}
                  className={itemClass}
                >
                  <MenuIcon path={ICONS.signOut} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="px-4 pb-2 pt-1 text-xs text-muted">Write, publish and track your posts.</p>
              <Link role="menuitem" href="/login" onClick={close} className={itemClass}>
                <MenuIcon path={ICONS.signIn} /> Sign in
              </Link>
              <Link role="menuitem" href="/register" onClick={close} className={itemClass}>
                <MenuIcon path={ICONS.signUp} /> Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
