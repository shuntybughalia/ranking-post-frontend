import "server-only";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getDb, isMongoConfigured } from "./mongodb";

const dataDir = path.join(process.cwd(), "data");

type StorageBackend = "mongo" | "file";

let storageBackend: StorageBackend | null = null;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function collectionName(filename: string): string {
  return filename.replace(/\.json$/, "");
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

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    storageBackend = "mongo";
  } catch (error) {
    console.warn(
      "MongoDB unavailable locally, falling back to data/*.json files:",
      error instanceof Error ? error.message : error,
    );
    storageBackend = "file";
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
    return JSON.parse(raw) as T;
  } catch {
    await writeJsonFile(filename, fallback);
    return fallback;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function readJsonMongo<T>(filename: string, fallback: T): Promise<T> {
  const db = await getDb();
  const collection = db.collection(collectionName(filename));
  const docs = await collection.find({}).toArray();

  if (docs.length === 0) {
    if (Array.isArray(fallback) && fallback.length > 0) {
      await writeJsonMongo(filename, fallback);
    }
    return fallback;
  }

  return docs.map(({ _id: _unused, ...rest }) => rest) as T;
}

async function writeJsonMongo<T>(filename: string, data: T): Promise<void> {
  if (!Array.isArray(data)) {
    throw new Error("MongoDB storage only supports array data.");
  }

  const db = await getDb();
  const collection = db.collection(collectionName(filename));

  await collection.deleteMany({});
  if (data.length > 0) {
    await collection.insertMany(data as Record<string, unknown>[]);
  }
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
