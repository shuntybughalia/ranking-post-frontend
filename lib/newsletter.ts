import "server-only";
import { readJson, writeJson } from "./db";
import type { NewsletterSubscriber } from "./types";

const NEWSLETTER_FILE = "newsletter.json";

export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  return readJson<NewsletterSubscriber[]>(NEWSLETTER_FILE, []);
}

export async function subscribeEmail(email: string): Promise<NewsletterSubscriber> {
  const normalized = email.trim().toLowerCase();
  const subscribers = await getSubscribers();

  const existing = subscribers.find((s) => s.email === normalized);
  if (existing) {
    return existing;
  }

  const subscriber: NewsletterSubscriber = {
    id: crypto.randomUUID(),
    email: normalized,
    subscribedAt: new Date().toISOString(),
  };

  subscribers.push(subscriber);
  await writeJson(NEWSLETTER_FILE, subscribers);

  return subscriber;
}
