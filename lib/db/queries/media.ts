import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";

export async function getAllMediaAssets() {
  await requireAuth();

  try {
    return await db
      .select()
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt));
  } catch {
    return [];
  }
}
