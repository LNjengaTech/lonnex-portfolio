import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experience } from "@/lib/db/schema";

export async function getExperienceList(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(experience)
        .orderBy(asc(experience.order), asc(experience.id));
    }

    return await db
      .select()
      .from(experience)
      .where(eq(experience.published, true))
      .orderBy(asc(experience.order), asc(experience.id));
  } catch (error) {
    console.error("[getExperienceList Error]:", error);
    return [];
  }
}
