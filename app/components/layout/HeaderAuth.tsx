import Link from "next/link";
import type { SessionUser } from "@/lib/types";

interface HeaderAuthProps {
  user: SessionUser | null;
  loading: boolean;
  onLogout: () => void;
  compact?: boolean;
}

function SignInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="15" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
      <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
    </svg>
  );
}

export default function HeaderAuth({ user, loading, onLogout, compact = false }: HeaderAuthProps) {
  if (loading) {
    return <div className="h-9 w-24" />;
  }

  const itemClass = `inline-flex items-center gap-1 text-[16px] font-semibold tracking-[0.5px] text-[#30384e] transition-colors hover:text-gold-dark ${
    compact ? "px-2 py-3" : "px-3 py-[22px]"
  }`;

  const canAdmin =
    user?.role === "admin" || user?.role === "super_admin";

  if (user) {
    return (
      <>
        <Link href="/my-posts" className={itemClass}>
          My Posts
        </Link>
        {canAdmin && (
          <Link href="/admin" className={itemClass}>
            Admin Panel
          </Link>
        )}
        <span className={`${itemClass} hover:text-[#30384e]`}>
          <span className="text-gold-dark">
            <UserIcon />
          </span>
          {user.name}
        </span>
        <button type="button" onClick={onLogout} className={itemClass}>
          <span className="text-gold-dark">
            <SignOutIcon />
          </span>
          Log out
        </button>
      </>
    );
  }

  return (
    <Link href="/login" className={itemClass}>
      <span className="mr-1 text-gold-dark">
        <SignInIcon />
      </span>
      Sign In
    </Link>
  );
}
