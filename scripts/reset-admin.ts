import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { adminUsers } from "../lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function run() {
  const email = (process.env.ADMIN_EMAIL || "admin@lonnex.dev").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const hash = await bcrypt.hash(password, 10);

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email));

  if (existing.length > 0) {
    await db
      .update(adminUsers)
      .set({ passwordHash: hash })
      .where(eq(adminUsers.email, email));
    console.log(`Successfully updated admin password for: ${email}`);
  } else {
    await db.insert(adminUsers).values({
      email,
      passwordHash: hash,
      name: "Lonnex Njenga",
      role: "admin",
    });
    console.log(`Successfully created admin user: ${email}`);
  }
  await client.end();
}

run().catch((err) => {
  console.error("Error setting admin password:", err);
  process.exit(1);
});
