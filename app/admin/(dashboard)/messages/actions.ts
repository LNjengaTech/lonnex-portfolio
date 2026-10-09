"use server";

import { revalidatePath, revalidateTag } from "@/lib/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMethods, messages } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  contactMethodSchema,
  messageStatusSchema,
  type ContactMethodInput,
} from "@/lib/validators/contact";

// ==========================================
// 1. CONTACT METHODS ACTIONS
// ==========================================

export async function createContactMethodAction(data: ContactMethodInput) {
  const user = await requireAuth();

  const validated = contactMethodSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [method] = await db
      .insert(contactMethods)
      .values({
        type: validated.data.type,
        label: validated.data.label,
        value: validated.data.value,
        icon: validated.data.icon,
        order: validated.data.order,
        visible: validated.data.visible,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "contact_method.create",
      entityType: "contact_method",
      entityId: String(method.id),
      details: { label: method.label, type: method.type },
    });

    revalidateTag("contact_methods");
    revalidatePath("/admin/messages");
    revalidatePath("/");

    return { success: true, method };
  } catch (error) {
    console.error("[createContactMethodAction Error]:", error);
    return { success: false, error: "Failed to create contact method." };
  }
}

export async function updateContactMethodAction(
  id: number,
  data: ContactMethodInput
) {
  const user = await requireAuth();

  const validated = contactMethodSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(contactMethods)
      .set({
        type: validated.data.type,
        label: validated.data.label,
        value: validated.data.value,
        icon: validated.data.icon,
        order: validated.data.order,
        visible: validated.data.visible,
        updatedAt: new Date(),
      })
      .where(eq(contactMethods.id, id));

    await logAudit({
      userId: user.id,
      action: "contact_method.update",
      entityType: "contact_method",
      entityId: String(id),
      details: { label: validated.data.label },
    });

    revalidateTag("contact_methods");
    revalidatePath("/admin/messages");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateContactMethodAction Error]:", error);
    return { success: false, error: "Failed to update contact method." };
  }
}

export async function deleteContactMethodAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(contactMethods).where(eq(contactMethods.id, id));

    await logAudit({
      userId: user.id,
      action: "contact_method.delete",
      entityType: "contact_method",
      entityId: String(id),
    });

    revalidateTag("contact_methods");
    revalidatePath("/admin/messages");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteContactMethodAction Error]:", error);
    return { success: false, error: "Failed to delete contact method." };
  }
}

export async function reorderContactMethodsAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(contactMethods)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(contactMethods.id, id))
      )
    );

    revalidateTag("contact_methods");
    revalidatePath("/admin/messages");

    return { success: true };
  } catch (error) {
    console.error("[reorderContactMethodsAction Error]:", error);
    return { success: false, error: "Failed to reorder contact methods." };
  }
}

export async function toggleVisibleContactMethodAction(
  id: number,
  visible: boolean
) {
  const user = await requireAuth();

  try {
    await db
      .update(contactMethods)
      .set({ visible, updatedAt: new Date() })
      .where(eq(contactMethods.id, id));

    revalidateTag("contact_methods");
    revalidatePath("/admin/messages");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[toggleVisibleContactMethodAction Error]:", error);
    return { success: false, error: "Failed to toggle visibility." };
  }
}

// ==========================================
// 2. MESSAGES INBOX ACTIONS
// ==========================================

export async function updateMessageStatusAction(
  id: number,
  status: "new" | "read" | "replied" | "archived"
) {
  const user = await requireAuth();

  const validated = messageStatusSchema.safeParse({ status });
  if (!validated.success) {
    return { success: false, error: "Invalid message status." };
  }

  try {
    await db
      .update(messages)
      .set({ status })
      .where(eq(messages.id, id));

    await logAudit({
      userId: user.id,
      action: "message.status_update",
      entityType: "message",
      entityId: String(id),
      details: { status },
    });

    revalidateTag("messages");
    revalidatePath("/admin/messages");

    return { success: true };
  } catch (error) {
    console.error("[updateMessageStatusAction Error]:", error);
    return { success: false, error: "Failed to update message status." };
  }
}

export async function deleteMessageAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(messages).where(eq(messages.id, id));

    await logAudit({
      userId: user.id,
      action: "message.delete",
      entityType: "message",
      entityId: String(id),
    });

    revalidateTag("messages");
    revalidatePath("/admin/messages");

    return { success: true };
  } catch (error) {
    console.error("[deleteMessageAction Error]:", error);
    return { success: false, error: "Failed to delete message." };
  }
}
