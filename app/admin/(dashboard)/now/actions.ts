"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { availability, buildLogEntries, nowProject } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  availabilitySchema,
  type AvailabilityInput,
} from "@/lib/validators/availability";
import {
  nowProjectSchema,
  buildLogEntrySchema,
  type NowProjectInput,
  type BuildLogEntryInput,
} from "@/lib/validators/now";

// 1. Availability Action
export async function updateAvailabilityAction(data: AvailabilityInput) {
  const user = await requireAuth();

  const validated = availabilitySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const { status, message, nextAvailableDate } = validated.data;

  try {
    await db
      .insert(availability)
      .values({
        id: "singleton",
        status,
        message,
        nextAvailableDate: nextAvailableDate || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: availability.id,
        set: {
          status,
          message,
          nextAvailableDate: nextAvailableDate || null,
          updatedAt: new Date(),
        },
      });

    await logAudit({
      userId: user.id,
      action: "availability.update",
      entityType: "availability",
      entityId: "singleton",
      details: { status },
    });

    revalidateTag("availability");
    revalidatePath("/admin/now");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateAvailabilityAction Error]:", error);
    return { success: false, error: "Failed to update availability." };
  }
}

// 2. Now Project Action
export async function updateNowProjectAction(
  id: number,
  data: NowProjectInput
) {
  const user = await requireAuth();

  const validated = nowProjectSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const { title, description, progress, stack, status } = validated.data;

  try {
    await db
      .update(nowProject)
      .set({
        title,
        description,
        progress,
        stack,
        status,
        updatedAt: new Date(),
      })
      .where(eq(nowProject.id, id));

    await logAudit({
      userId: user.id,
      action: "now_project.update",
      entityType: "now_project",
      entityId: String(id),
      details: { title, progress },
    });

    revalidateTag("now_project");
    revalidatePath("/admin/now");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateNowProjectAction Error]:", error);
    return { success: false, error: "Failed to update current project." };
  }
}

// 3. Build Log Actions
export async function createBuildLogEntryAction(data: BuildLogEntryInput) {
  const user = await requireAuth();

  const validated = buildLogEntrySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [newEntry] = await db
      .insert(buildLogEntries)
      .values({
        projectId: validated.data.projectId || null,
        title: validated.data.title,
        content: validated.data.content,
        logDate: validated.data.logDate,
        order: validated.data.order,
        published: validated.data.published,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "build_log.create",
      entityType: "build_log_entry",
      entityId: String(newEntry.id),
      details: { title: newEntry.title },
    });

    revalidateTag("build_log");
    revalidatePath("/admin/now");
    revalidatePath("/");

    return { success: true, entry: newEntry };
  } catch (error) {
    console.error("[createBuildLogEntryAction Error]:", error);
    return { success: false, error: "Failed to create log entry." };
  }
}

export async function updateBuildLogEntryAction(
  id: number,
  data: BuildLogEntryInput
) {
  const user = await requireAuth();

  const validated = buildLogEntrySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(buildLogEntries)
      .set({
        title: validated.data.title,
        content: validated.data.content,
        logDate: validated.data.logDate,
        order: validated.data.order,
        published: validated.data.published,
        updatedAt: new Date(),
      })
      .where(eq(buildLogEntries.id, id));

    await logAudit({
      userId: user.id,
      action: "build_log.update",
      entityType: "build_log_entry",
      entityId: String(id),
      details: { title: validated.data.title },
    });

    revalidateTag("build_log");
    revalidatePath("/admin/now");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateBuildLogEntryAction Error]:", error);
    return { success: false, error: "Failed to update log entry." };
  }
}

export async function deleteBuildLogEntryAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(buildLogEntries).where(eq(buildLogEntries.id, id));

    await logAudit({
      userId: user.id,
      action: "build_log.delete",
      entityType: "build_log_entry",
      entityId: String(id),
    });

    revalidateTag("build_log");
    revalidatePath("/admin/now");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteBuildLogEntryAction Error]:", error);
    return { success: false, error: "Failed to delete log entry." };
  }
}

export async function reorderBuildLogEntriesAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(buildLogEntries)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(buildLogEntries.id, id))
      )
    );

    await logAudit({
      userId: user.id,
      action: "build_log.reorder",
      entityType: "build_log_entry",
      details: { count: ids.length },
    });

    revalidateTag("build_log");
    revalidatePath("/admin/now");

    return { success: true };
  } catch (error) {
    console.error("[reorderBuildLogEntriesAction Error]:", error);
    return { success: false, error: "Failed to reorder log entries." };
  }
}

export async function togglePublishBuildLogEntryAction(
  id: number,
  published: boolean
) {
  const user = await requireAuth();

  try {
    await db
      .update(buildLogEntries)
      .set({ published, updatedAt: new Date() })
      .where(eq(buildLogEntries.id, id));

    await logAudit({
      userId: user.id,
      action: "build_log.toggle_publish",
      entityType: "build_log_entry",
      entityId: String(id),
      details: { published },
    });

    revalidateTag("build_log");
    revalidatePath("/admin/now");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishBuildLogEntryAction Error]:", error);
    return { success: false, error: "Failed to update publish status." };
  }
}
