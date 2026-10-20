import "server-only";
import { Resolver } from "node:dns/promises";
import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
  _mongoClientOptionsKey?: string;
};

// Bump when client options change so a dev server's hot reload drops the old cached client.
const CLIENT_OPTIONS_KEY = "socket-90s-connect-30s";

function getDnsServers(): string[] {
  const configured = process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  // Local Windows workaround when ISP/antivirus DNS blocks MongoDB SRV lookups.
  if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true") {
    return ["8.8.8.8", "1.1.1.1"];
  }

  return [];
}

/**
 * mongodb+srv relies on DNS SRV. Some local DNS resolvers refuse those queries.
 * Resolve via public DNS and rewrite to a standard mongodb:// URI when needed.
 */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const servers = getDnsServers();
  if (servers.length === 0) {
    return uri;
  }

  const parsed = new URL(uri.replace(/^mongodb\+srv:/, "https:"));
  const hostname = parsed.hostname;
  if (!hostname) {
    return uri;
  }

  const resolver = new Resolver();
  resolver.setServers(servers);

  const records = await Promise.race([
    resolver.resolveSrv(`_mongodb._tcp.${hostname}`),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB SRV DNS lookup timed out")), 5000),
    ),
  ]);
  if (!records.length) {
    return uri;
  }

  const hosts = records
    .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    .map((record) => `${record.name}:${record.port}`)
    .join(",");

  const auth = parsed.username
    ? `${decodeURIComponent(parsed.username)}${
        parsed.password ? `:${decodeURIComponent(parsed.password)}` : ""
      }@`
    : "";

  const search = new URLSearchParams(parsed.search);
  if (!search.has("ssl") && !search.has("tls")) {
    search.set("tls", "true");
  }
  if (!search.has("authSource") && parsed.username) {
    search.set("authSource", "admin");
  }
  if (!search.has("retryWrites")) {
    search.set("retryWrites", "true");
  }
  if (!search.has("w")) {
    search.set("w", "majority");
  }

  const dbPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/";
  const query = search.toString();
  return `mongodb://${auth}${hosts}${dbPath}${query ? `?${query}` : ""}`;
}

function getMongoUri(): string | undefined {
  return (
    process.env.MONGODB_URI?.trim() ||
    process.env.MONGO_URI?.trim() ||
    process.env.MONO_URI?.trim()
  );
}

function getDbName(): string {
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

  if (
    globalForMongo._mongoClient &&
    globalForMongo._mongoClientOptionsKey !== CLIENT_OPTIONS_KEY
  ) {
    const stale = globalForMongo._mongoClient;
    globalForMongo._mongoClient = undefined;
    globalForMongo._mongoDb = undefined;
    stale.close().catch(() => {});
  }

  if (globalForMongo._mongoDb) {
    return globalForMongo._mongoDb;
  }

  const allowInvalidCerts =
    process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true";

  const resolvedUri = await resolveMongoUri(uri);

  const client =
    globalForMongo._mongoClient ??
    new MongoClient(resolvedUri, {
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 15000,
      // New pool connections handshake while large reads saturate slow links; 5s isn't enough there.
      connectTimeoutMS: 30000,
      // Article stores are single multi-MB documents; slow links need well over 20s to read them.
      socketTimeoutMS: 90000,
      ...(allowInvalidCerts ? { tlsAllowInvalidCertificates: true } : {}),
    });

  if (!globalForMongo._mongoClient) {
    await client.connect();
    globalForMongo._mongoClient = client;
    globalForMongo._mongoClientOptionsKey = CLIENT_OPTIONS_KEY;
  }

  globalForMongo._mongoDb = client.db(getDbName());
  return globalForMongo._mongoDb;
}
