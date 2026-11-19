"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api-client";

interface Draft {
  seoTitle: string;
  metaDescription: string;
  article: string;
}

const field = "w-full rounded-lg border border-border px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const button = "rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50 disabled:opacity-60";

export default function Generator() {
  const [keyword, setKeyword] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [draft, setDraft] = useState<Draft>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (draft && !window.confirm("Replace this draft and its edits with a new version?")) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      setDraft(await apiFetch<Draft>("/api/guest-post-generator", {
        method: "POST",
        json: { keyword, targetUrl },
        toastOnError: false,
      }));
      setStatus("Draft ready.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function update(key: keyof Draft, value: string) {
    setDraft((current) => current && { ...current, [key]: value });
  }

  const exportText = draft
    ? `SEO title: ${draft.seoTitle}\nMeta description: ${draft.metaDescription}\n\n${draft.article}\n`
    : "";

  async function copy() {
    setError("");
    try {
      await navigator.clipboard.writeText(exportText);
      setStatus("Draft and SEO metadata copied.");
    } catch {
      setError("Clipboard access is unavailable. Use Download instead.");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportText], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest-post.md";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={generate} className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-navy">
            <span>Primary keyword</span>
            <input className={field} required maxLength={120} value={keyword} disabled={busy}
              onChange={(event) => setKeyword(event.target.value)} placeholder="e.g. local SEO for dentists" />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-navy">
            <span>Target URL (optional)</span>
            <input className={field} type="url" maxLength={2048} value={targetUrl} disabled={busy}
              onChange={(event) => setTargetUrl(event.target.value)} placeholder="https://example.com/page" />
          </label>
        </div>
        <button type="submit" disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60">
          {busy ? "Generating…" : draft ? "Regenerate" : "Generate guest post"}
        </button>
      </form>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <p role="status" className="sr-only">{busy ? "Generating guest post." : status}</p>
      {draft && (
        <section aria-labelledby="draft-heading" className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="draft-heading" className="text-xl font-bold text-navy">Edit your draft</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copy} className={button}>Copy</button>
              <button type="button" onClick={download} className={button}>Download Markdown</button>
            </div>
          </div>
          {status && <p className="text-sm text-muted">{status}</p>}
          <label className="block space-y-1.5 text-sm font-medium text-navy">
            <span>SEO title</span>
            <input className={field} value={draft.seoTitle} disabled={busy} onChange={(event) => update("seoTitle", event.target.value)} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-navy">
            <span>Meta description</span>
            <textarea className={field} rows={2} value={draft.metaDescription} disabled={busy} onChange={(event) => update("metaDescription", event.target.value)} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-navy">
            <span>Article (Markdown)</span>
            <textarea className={`${field} min-h-96 resize-y font-mono leading-relaxed`} rows={20}
              value={draft.article} disabled={busy} onChange={(event) => update("article", event.target.value)} />
          </label>
        </section>
      )}
    </div>
  );
}
