import "server-only";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);

  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await writeJson(filename, fallback);
    return fallback;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
