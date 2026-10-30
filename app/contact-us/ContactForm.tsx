"use client";

import { FormEvent, useState } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api-client";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

const inputClass =
  "w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  // Hidden from people; bots that fill every field are ignored by the server.
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        json: { ...form, website },
        toastOnError: false,
      });
      setForm(EMPTY_FORM);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl border border-gold bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-navy">Thank you for contacting us!</h3>
        <p className="mt-2 text-sm text-muted">
          We&apos;ve received your message and will reply to your email.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-navy hover:bg-slate-50"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-navy">
            Your Name *
          </label>
          <input
            id="contact-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            maxLength={100}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-navy">
            Your Email *
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-navy">
          Subject *
        </label>
        <input
          id="contact-subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          required
          maxLength={150}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-navy">
          Message *
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className={inputClass}
        />
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
