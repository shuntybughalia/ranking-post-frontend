"use client";

import type { FaqItem } from "@/lib/types";

const MAX_FAQS = 20;

interface FaqEditorProps {
  value: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}

const inputClass =
  "w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

/** Edits a post's FAQ list; shown on the post as an accordion. */
export default function FaqEditor({ value, onChange }: FaqEditorProps) {
  function updateItem(index: number, field: keyof FaqItem, text: string) {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: text } : item)));
  }

  return (
    <div className="space-y-4">
      {value.map((item, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              FAQ {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            aria-label={`FAQ ${index + 1} question`}
            value={item.question}
            onChange={(e) => updateItem(index, "question", e.target.value)}
            maxLength={300}
            placeholder="Question"
            className={inputClass}
          />
          <textarea
            aria-label={`FAQ ${index + 1} answer`}
            value={item.answer}
            onChange={(e) => updateItem(index, "answer", e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Answer"
            className={inputClass}
          />
        </div>
      ))}

      {value.length < MAX_FAQS && (
        <button
          type="button"
          onClick={() => onChange([...value, { question: "", answer: "" }])}
          className="rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
        >
          + Add FAQ
        </button>
      )}
    </div>
  );
}
