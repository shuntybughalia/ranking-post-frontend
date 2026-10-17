import type { ReactNode } from "react";

interface StatusMessageProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/** Centered full-page message used by error, not-found and empty states. */
export default function StatusMessage({ title, description, children }: StatusMessageProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-cream px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-[24px] font-semibold leading-[30px] text-gold-dark">{title}</h1>
        <p className="mt-3 text-[14px] leading-[21px] text-[#2a2a2b]">{description}</p>
        {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </main>
  );
}

export const primaryButton =
  "inline-flex rounded-[4px] border-[0.8px] border-gold bg-gold px-[15px] py-[10px] text-[13px] font-medium tracking-[0.5px] text-ink transition-colors hover:bg-gold-light";

export const secondaryButton =
  "inline-flex rounded-[4px] border-[0.8px] border-gold bg-white px-[15px] py-[10px] text-[13px] font-medium tracking-[0.5px] text-ink transition-colors hover:bg-gold hover:text-ink";
