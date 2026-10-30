import "server-only";
import { readJson, writeJson } from "./db";
import type { ContactMessage } from "./types";

const CONTACT_FILE = "contact-messages.json";
const MAX_STORED_MESSAGES = 1000;
const SEND_COOLDOWN_MS = 60_000;

const LIMITS = { name: 100, subject: 150, message: 5000 };

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Newest first. */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const messages = await readJson<ContactMessage[]>(CONTACT_FILE, []);
  return [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseContactInput(body: Record<string, unknown>): ContactInput {
  return {
    name: asText(body.name),
    email: asText(body.email).toLowerCase(),
    subject: asText(body.subject),
    message: asText(body.message),
  };
}

export function validateContactInput(input: ContactInput): string | null {
  if (!input.name) return "Please enter your name.";
  if (input.name.length > LIMITS.name) return "Name is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return "Please enter a valid email address.";
  }
  if (!input.subject) return "Please enter a subject.";
  if (input.subject.length > LIMITS.subject) return "Subject is too long.";
  if (input.message.length < 10) return "Message must be at least 10 characters.";
  if (input.message.length > LIMITS.message) {
    return `Message must be ${LIMITS.message} characters or fewer.`;
  }
  return null;
}

/** Saves a message, or returns false if this email sent one moments ago. */
export async function addContactMessage(input: ContactInput): Promise<boolean> {
  const messages = await readJson<ContactMessage[]>(CONTACT_FILE, []);

  const lastFromSender = messages
    .filter((message) => message.email === input.email)
    .reduce((latest, message) => Math.max(latest, new Date(message.createdAt).getTime()), 0);
  if (Date.now() - lastFromSender < SEND_COOLDOWN_MS) return false;

  const message: ContactMessage = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };

  // All messages share one stored document, so cap it by dropping the oldest.
  await writeJson(CONTACT_FILE, [...messages, message].slice(-MAX_STORED_MESSAGES));
  return true;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const messages = await readJson<ContactMessage[]>(CONTACT_FILE, []);
  const remaining = messages.filter((message) => message.id !== id);
  if (remaining.length === messages.length) return false;

  await writeJson(CONTACT_FILE, remaining);
  return true;
}
