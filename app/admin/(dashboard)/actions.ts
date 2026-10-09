"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { availability } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { availabilitySchema } from "@/lib/validators/availability";

export async function updateQuickAvailabilityAction(
  status: "available" | "limited" | "booked"
) {
  const user = await requireAuth();

  const validatedStatus = availabilitySchema.shape.status.safeParse(status);
  if (!validatedStatus.success) {
    return { success: false, error: "Invalid availability status." };
  }

  try {
    await db
      .insert(availability)
      .values({
        id: "singleton",
        status,
        message:
          status === "available"
            ? "Open for select web development contracts and commercial commissions."
            : status === "limited"
            ? "Limited bandwidth. Taking select high-impact projects."
            : "Fully booked. Inquiries open for next quarter.",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: availability.id,
        set: {
          status,
          updatedAt: new Date(),
        },
      });

    await logAudit({
      userId: user.id,
      action: "availability.quick_update",
      entityType: "availability",
      entityId: "singleton",
      details: { status },
    });

    revalidateTag("availability");
    revalidatePath("/admin");

    return { success: true, status };
  } catch (error) {
    console.error("[updateQuickAvailabilityAction Error]:", error);
    return { success: false, error: "Failed to update availability status." };
  }
}
