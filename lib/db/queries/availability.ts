import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { availability } from "@/lib/db/schema";

export type AvailabilityStatus = "available" | "limited" | "booked";

export async function getAvailability() {
  try {
    const records = await db
      .select()
      .from(availability)
      .where(eq(availability.id, "singleton"))
      .limit(1);

    if (records.length > 0) {
      return records[0];
    }
  } catch (error) {
    console.error("[getAvailability Error]:", error);
  }

  return {
    id: "singleton",
    status: "available" as AvailabilityStatus,
    message: "Open for select web development contracts and commercial brand commissions.",
    nextAvailableDate: "Immediate",
    updatedAt: new Date(),
  };
}
