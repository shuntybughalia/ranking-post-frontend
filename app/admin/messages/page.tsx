import type { Metadata } from "next";
import { getContactMessages } from "@/lib/contact";
import DeleteMessageButton from "../components/DeleteMessageButton";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

function replyHref(email: string, subject: string) {
  const address = encodeURIComponent(email).replace("%40", "@");
  return `mailto:${address}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
}

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Messages</h1>
        <p className="mt-1 text-sm text-muted">
          {messages.length} message{messages.length !== 1 ? "s" : ""} from the contact page.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-muted">No messages yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <h2 className="min-w-0 break-words font-semibold text-navy">{message.subject}</h2>
                <time dateTime={message.createdAt} className="text-xs text-muted">
                  {new Date(message.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <p className="mt-1 break-words text-sm text-muted">
                {message.name} · {message.email}
              </p>
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-[#30384e]">
                {message.message}
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href={replyHref(message.email, message.subject)}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                >
                  Reply by email
                </a>
                <DeleteMessageButton id={message.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
