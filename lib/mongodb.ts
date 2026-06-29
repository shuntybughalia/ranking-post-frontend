import "server-only";
import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
};

export function getMongoUri(): string | undefined {
  return (
    process.env.MONGODB_URI?.trim() ||
    process.env.MONGO_URI?.trim() ||
    process.env.MONO_URI?.trim()
  );
}

export function getDbName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || "rankingpost";
}

export function isMongoConfigured(): boolean {
  return Boolean(getMongoUri());
}

export async function getDb(): Promise<Db> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in your environment variables.",
    );
  }

  if (globalForMongo._mongoDb) {
    return globalForMongo._mongoDb;
  }

  const allowInvalidCerts =
    process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true";

  const client =
    globalForMongo._mongoClient ??
    new MongoClient(uri, {
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      ...(allowInvalidCerts ? { tlsAllowInvalidCertificates: true } : {}),
    });

  if (!globalForMongo._mongoClient) {
    await client.connect();
    globalForMongo._mongoClient = client;
  }

  globalForMongo._mongoDb = client.db(getDbName());
  return globalForMongo._mongoDb;
}
