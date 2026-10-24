import type { Gender } from "@/lib/types";

const BACKGROUNDS: Record<Gender | "neutral", string> = {
  male: "#2563eb",
  female: "#db2777",
  neutral: "#94a3b8",
};

const HAIR = "rgba(15, 23, 42, 0.45)";

interface UserAvatarProps {
  gender?: Gender;
  /** Profile photo; when set it replaces the icon. */
  src?: string;
  /** Tailwind size classes, e.g. "h-9 w-9". */
  className?: string;
}

/** Round avatar: the user's photo, or a male, female or neutral person icon. */
export default function UserAvatar({ gender, src, className = "h-9 w-9" }: UserAvatarProps) {
  if (src) {
    return (
      <span className={`inline-flex shrink-0 overflow-hidden rounded-full bg-slate-200 ${className}`}>
        {/* Photos can come from any host (S3, MongoDB, a pasted URL), so next/image can't optimise them. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: BACKGROUNDS[gender ?? "neutral"] }}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
        {gender === "female" && (
          // Long hair behind the head and shoulders.
          <path d="M18 30c0-11 6-18 14-18s14 7 14 18v15c-4 2-9 3-14 3s-10-1-14-3z" fill={HAIR} />
        )}
        <path d="M10 64c0-13 10-21 22-21s22 8 22 21z" fill="#fff" />
        <circle cx="32" cy="28" r="11" fill="#fff" />
        {gender === "male" && (
          <path d="M21 27c0-8 5-13 11-13s11 5 11 13c-2-4-6-6-11-6s-9 2-11 6z" fill={HAIR} />
        )}
        {gender === "female" && (
          <path d="M21 28c1-8 5-12 11-12s10 4 11 12c-3-4-7-6-11-6s-8 2-11 6z" fill={HAIR} />
        )}
      </svg>
    </span>
  );
}
