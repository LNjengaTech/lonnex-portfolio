import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";

export async function getServicesList(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(services)
        .orderBy(asc(services.order), asc(services.id));
    }

    return await db
      .select()
      .from(services)
      .where(eq(services.published, true))
      .orderBy(asc(services.order), asc(services.id));
  } catch (error) {
    console.error("[getServicesList Error]:", error);
    return [];
  }
}
