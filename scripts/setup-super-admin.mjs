/**
 * Bootstrap the super admin account from .env variables.
 * Run: npm run setup:super-admin
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = join(process.cwd(), "data");
const USERS_FILE = join(DATA_DIR, "users.json");

function loadEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnv();

  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) {
    console.error(
      "Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env",
    );
    console.error("Copy .env.example and set your super admin credentials.");
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  let users = [];
  if (existsSync(USERS_FILE)) {
    users = JSON.parse(readFileSync(USERS_FILE, "utf-8"));
  }

  const index = users.findIndex((u) => u.email.toLowerCase() === email);
  const passwordHash = await bcrypt.hash(password, 10);

  if (index === -1) {
    users.push({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      role: "super_admin",
      createdAt: new Date().toISOString(),
    });
    console.log("Created super admin account:", email);
  } else {
    users[index].name = name;
    users[index].role = "super_admin";
    users[index].passwordHash = passwordHash;
    console.log("Updated super admin account:", email);
  }

  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log("\nSuper admin ready. Log in at /login with:");
  console.log("  Email:   ", email);
  console.log("  Password:", "(value from SUPER_ADMIN_PASSWORD in .env)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
