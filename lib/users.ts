import "server-only";
import bcrypt from "bcryptjs";
import { normalizeRole } from "./permissions";
import { readJson, writeJson } from "./db";
import type { PublicUser, SessionUser, User, UserRole } from "./types";

const USERS_FILE = "users.json";

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    createdAt: user.createdAt,
  };
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  };
}

function normalizeUser(user: User): User {
  return { ...user, role: normalizeRole(user.role) };
}

export async function getUsers(): Promise<User[]> {
  const users = await readJson<User[]>(USERS_FILE, []);
  return users.map(normalizeUser);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function ensureSuperAdmin(): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) return;

  const users = await readJson<User[]>(USERS_FILE, []);
  const index = users.findIndex((u) => u.email.toLowerCase() === email);

  if (index === -1) {
    users.push({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "super_admin",
      createdAt: new Date().toISOString(),
    });
    await writeJson(USERS_FILE, users);
    return;
  }

  const existing = normalizeUser(users[index]);
  let changed = false;

  if (existing.role !== "super_admin") {
    existing.role = "super_admin";
    changed = true;
  }

  if (process.env.SUPER_ADMIN_SYNC_PASSWORD === "true") {
    const valid = await bcrypt.compare(password, existing.passwordHash);
    if (!valid) {
      existing.passwordHash = await bcrypt.hash(password, 10);
      changed = true;
    }
  }

  if (changed) {
    users[index] = existing;
    await writeJson(USERS_FILE, users);
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<SessionUser> {
  await ensureSuperAdmin();

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
    role: "user",
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeJson(USERS_FILE, users);

  return toSessionUser(user);
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  await ensureSuperAdmin();

  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return toSessionUser(user);
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

  return toSessionUser(users[index]);
}

export async function updateUserRole(
  id: string,
  role: UserRole,
  actorId: string,
): Promise<PublicUser | null> {
  if (id === actorId) {
    throw new Error("You cannot change your own role.");
  }

  const users = await getUsers();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) return null;

  if (normalizeRole(users[index].role) === "super_admin" && role !== "super_admin") {
    const superAdmins = users.filter(
      (u) => normalizeRole(u.role) === "super_admin",
    );
    if (superAdmins.length <= 1) {
      throw new Error("Cannot demote the only super admin.");
    }
  }

  users[index].role = role;
  await writeJson(USERS_FILE, users);

  return toPublicUser(users[index]);
}

export async function deleteUser(
  id: string,
  actorId: string,
): Promise<boolean> {
  if (id === actorId) {
    throw new Error("You cannot delete your own account.");
  }

  const users = await getUsers();
  const target = users.find((u) => u.id === id);

  if (!target) return false;

  if (normalizeRole(target.role) === "super_admin") {
    const superAdmins = users.filter(
      (u) => normalizeRole(u.role) === "super_admin",
    );
    if (superAdmins.length <= 1) {
      throw new Error("Cannot delete the only super admin.");
    }
  }

  const filtered = users.filter((u) => u.id !== id);
  await writeJson(USERS_FILE, filtered);
  return true;
}
