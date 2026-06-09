import "server-only";
import bcrypt from "bcryptjs";
import { readJson, writeJson } from "./db";
import type { SessionUser, User } from "./types";

const USERS_FILE = "users.json";

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>(USERS_FILE, []);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<SessionUser> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const users = await getUsers();
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeJson(USERS_FILE, users);

  return { id: user.id, name: user.name, email: user.email };
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, name: user.name, email: user.email };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

export async function updateUserProfile(
  id: string,
  updates: { name?: string; password?: string },
): Promise<SessionUser | null> {
  const users = await getUsers();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) return null;

  if (updates.name !== undefined) {
    users[index].name = updates.name.trim();
  }

  if (updates.password !== undefined) {
    users[index].passwordHash = await bcrypt.hash(updates.password, 10);
  }

  await writeJson(USERS_FILE, users);

  const user = users[index];
  return { id: user.id, name: user.name, email: user.email };
}
