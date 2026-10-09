import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";

export async function getTestimonialsList(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(testimonials)
        .orderBy(asc(testimonials.order), asc(testimonials.id));
    }

    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.published, true))
      .orderBy(asc(testimonials.order), asc(testimonials.id));
  } catch (error) {
    console.error("[getTestimonialsList Error]:", error);
    return [];
  }
}
