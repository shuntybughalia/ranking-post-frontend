import "server-only";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getDb, isMongoConfigured } from "./mongodb";

const dataDir = path.join(process.cwd(), "data");
const STORE_KEY = "_storeKey";

type StorageBackend = "mongo" | "file";

let storageBackend: StorageBackend | null = null;
let mongoRetryAfter = 0;
const MONGO_RETRY_COOLDOWN_MS = 60_000;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function collectionName(filename: string): string {
  return filename.replace(/\.json$/, "");
}

function dedupeById<T extends { id?: string }>(items: T[]): T[] {
  const map = new Map<string, T>();

  for (const item of items) {
    if (item.id) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

async function resolveStorageBackend(): Promise<StorageBackend> {
  if (storageBackend) {
    return storageBackend;
  }

  if (isServerless()) {
    if (!isMongoConfigured()) {
      throw new Error(
        "Database not configured. Set MONGODB_URI in your Vercel environment variables.",
      );
    }
    storageBackend = "mongo";
    return storageBackend;
  }

  if (!isMongoConfigured()) {
    storageBackend = "file";
    return storageBackend;
  }

  // After a failed Mongo attempt, serve local files for a cooldown so listing
  // requests don't block on repeated 10s connection timeouts.
  if (Date.now() < mongoRetryAfter) {
    return "file";
  }

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    storageBackend = "mongo";
    mongoRetryAfter = 0;
  } catch (error) {
    console.warn(
      "MongoDB unavailable locally, falling back to data/*.json files:",
      error instanceof Error ? error.message : error,
    );
    mongoRetryAfter = Date.now() + MONGO_RETRY_COOLDOWN_MS;
    return "file";
  }

  return storageBackend;
}

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);

  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    if (Array.isArray(parsed)) {
      return dedupeById(parsed as Array<{ id?: string }>) as T;
    }
    return parsed;
  } catch {
    await writeJsonFile(filename, fallback);
    return fallback;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  const payload = Array.isArray(data)
    ? dedupeById(data as Array<{ id?: string }>)
    : data;
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
}

async function readJsonMongo<T>(filename: string, fallback: T): Promise<T> {
  const db = await getDb();
  const collection = db.collection(collectionName(filename));
  const stored = await collection.findOne({ [STORE_KEY]: filename });

  if (stored?.data) {
    const data = stored.data as T;
    if (Array.isArray(data)) {
      return dedupeById(data as Array<{ id?: string }>) as T;
    }
    return data;
  }

  const legacyDocs = await collection
    .find({ [STORE_KEY]: { $exists: false } })
    .toArray();

  if (legacyDocs.length > 0) {
    const items = dedupeById(
      legacyDocs.map(({ _id: _unused, ...rest }) => rest as { id?: string }),
    );
    await writeJsonMongo(filename, items as T);
    return items as T;
  }

  if (Array.isArray(fallback) && fallback.length > 0) {
    await writeJsonMongo(filename, fallback);
  }

  return fallback;
}

async function writeJsonMongo<T>(filename: string, data: T): Promise<void> {
  const db = await getDb();
  const collection = db.collection(collectionName(filename));
  const payload = Array.isArray(data)
    ? dedupeById(data as Array<{ id?: string }>)
    : data;

  await collection.replaceOne(
    { [STORE_KEY]: filename },
    { [STORE_KEY]: filename, data: payload },
    { upsert: true, maxTimeMS: 15_000 },
  );

  await collection.deleteMany(
    { [STORE_KEY]: { $exists: false } },
    { maxTimeMS: 15_000 },
  );
}

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  const backend = await resolveStorageBackend();
  return backend === "mongo"
    ? readJsonMongo(filename, fallback)
    : readJsonFile(filename, fallback);
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const backend = await resolveStorageBackend();
  return backend === "mongo"
    ? writeJsonMongo(filename, data)
    : writeJsonFile(filename, data);
}
