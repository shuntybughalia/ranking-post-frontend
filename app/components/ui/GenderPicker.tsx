"use client";

import UserAvatar from "@/app/components/ui/UserAvatar";
import { GENDERS, type Gender } from "@/lib/types";

interface GenderPickerProps {
  value?: Gender;
  onChange: (gender: Gender) => void;
}

const LABELS: Record<Gender, string> = { male: "Male", female: "Female" };

/** Two selectable cards showing the avatar each choice gives. */
export default function GenderPicker({ value, onChange }: GenderPickerProps) {
  return (
    <div role="radiogroup" aria-label="Gender" className="grid grid-cols-2 gap-3">
      {GENDERS.map((gender) => {
        const selected = value === gender;
        return (
          <button
            key={gender}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(gender)}
            className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? "border-accent bg-cream text-ink ring-2 ring-accent/30"
                : "border-border bg-white text-muted hover:border-slate-300 hover:text-navy"
            }`}
          >
            <UserAvatar gender={gender} className="h-8 w-8" />
            {LABELS[gender]}
          </button>
        );
      })}
    </div>
  );
}
