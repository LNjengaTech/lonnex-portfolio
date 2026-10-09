import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

// Cache the postgres client across hot reloads in development
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const requiresSsl =
  process.env.NODE_ENV === "production" ||
  connectionString.includes("sslmode=require") ||
  connectionString.includes("ssl=true") ||
  connectionString.includes(".neon.tech") ||
  connectionString.includes(".supabase.co") ||
  process.env.DATABASE_SSL === "true";

const client =
  globalForDb.conn ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: requiresSsl ? "require" : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
export { schema };
