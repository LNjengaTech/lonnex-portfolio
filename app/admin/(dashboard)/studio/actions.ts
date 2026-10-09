"use server";

import { revalidatePath, revalidateTag } from "@/lib/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  studioCategories,
  studioCollections,
  studioItems,
} from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  studioCategorySchema,
  studioCollectionSchema,
  studioItemSchema,
  studioBulkItemSchema,
  type StudioCategoryInput,
  type StudioCollectionInput,
  type StudioItemInput,
  type StudioBulkItemInput,
} from "@/lib/validators/studio";

// ==========================================
// 1. STUDIO CATEGORIES ACTIONS
// ==========================================

export async function createStudioCategoryAction(data: StudioCategoryInput) {
  const user = await requireAuth();

  const validated = studioCategorySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [cat] = await db
      .insert(studioCategories)
      .values(validated.data)
      .returning();

    await logAudit({
      userId: user.id,
      action: "studio_category.create",
      entityType: "studio_category",
      entityId: String(cat.id),
      details: { name: cat.name },
    });

    revalidateTag("studio_categories");
    revalidatePath("/admin/studio");

    return { success: true, category: cat };
  } catch (error) {
    console.error("[createStudioCategoryAction Error]:", error);
    return { success: false, error: "Failed to create studio category." };
  }
}

export async function updateStudioCategoryAction(
  id: number,
  data: StudioCategoryInput
) {
  const user = await requireAuth();

  const validated = studioCategorySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(studioCategories)
      .set({
        ...validated.data,
        updatedAt: new Date(),
      })
      .where(eq(studioCategories.id, id));

    revalidateTag("studio_categories");
    revalidatePath("/admin/studio");

    return { success: true };
  } catch (error) {
    console.error("[updateStudioCategoryAction Error]:", error);
    return { success: false, error: "Failed to update studio category." };
  }
}

export async function deleteStudioCategoryAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(studioCategories).where(eq(studioCategories.id, id));

    await logAudit({
      userId: user.id,
      action: "studio_category.delete",
      entityType: "studio_category",
      entityId: String(id),
    });

    revalidateTag("studio_categories");
    revalidatePath("/admin/studio");

    return { success: true };
  } catch (error) {
    console.error("[deleteStudioCategoryAction Error]:", error);
    return { success: false, error: "Failed to delete studio category." };
  }
}

export async function reorderStudioCategoriesAction(ids: number[]) {
  await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(studioCategories)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(studioCategories.id, id))
      )
    );

    revalidateTag("studio_categories");
    revalidatePath("/admin/studio");

    return { success: true };
  } catch (error) {
    console.error("[reorderStudioCategoriesAction Error]:", error);
    return { success: false, error: "Failed to reorder categories." };
  }
}

// ==========================================
// 2. STUDIO COLLECTIONS ACTIONS
// ==========================================

export async function createStudioCollectionAction(data: StudioCollectionInput) {
  const user = await requireAuth();

  const validated = studioCollectionSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [col] = await db
      .insert(studioCollections)
      .values(validated.data)
      .returning();

    revalidateTag("studio_collections");
    revalidatePath("/admin/studio");

    return { success: true, collection: col };
  } catch (error) {
    console.error("[createStudioCollectionAction Error]:", error);
    return { success: false, error: "Failed to create collection." };
  }
}

export async function updateStudioCollectionAction(
  id: number,
  data: StudioCollectionInput
) {
  await requireAuth();

  const validated = studioCollectionSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(studioCollections)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(eq(studioCollections.id, id));

    revalidateTag("studio_collections");
    revalidatePath("/admin/studio");

    return { success: true };
  } catch (error) {
    console.error("[updateStudioCollectionAction Error]:", error);
    return { success: false, error: "Failed to update collection." };
  }
}

export async function deleteStudioCollectionAction(id: number) {
  await requireAuth();

  try {
    await db.delete(studioCollections).where(eq(studioCollections.id, id));
    revalidateTag("studio_collections");
    revalidatePath("/admin/studio");
    return { success: true };
  } catch (error) {
    console.error("[deleteStudioCollectionAction Error]:", error);
    return { success: false, error: "Failed to delete collection." };
  }
}

// ==========================================
// 3. STUDIO ITEMS ACTIONS
// ==========================================

export async function createStudioItemAction(data: StudioItemInput) {
  const user = await requireAuth();

  const validated = studioItemSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [item] = await db
      .insert(studioItems)
      .values(validated.data)
      .returning();

    await logAudit({
      userId: user.id,
      action: "studio_item.create",
      entityType: "studio_item",
      entityId: String(item.id),
      details: { title: item.title },
    });

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");
    revalidatePath("/");

    return { success: true, item };
  } catch (error) {
    console.error("[createStudioItemAction Error]:", error);
    return { success: false, error: "Failed to create studio item." };
  }
}

export async function updateStudioItemAction(
  id: number,
  data: StudioItemInput
) {
  const user = await requireAuth();

  const validated = studioItemSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(studioItems)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(eq(studioItems.id, id));

    await logAudit({
      userId: user.id,
      action: "studio_item.update",
      entityType: "studio_item",
      entityId: String(id),
      details: { title: validated.data.title },
    });

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateStudioItemAction Error]:", error);
    return { success: false, error: "Failed to update studio item." };
  }
}

export async function deleteStudioItemAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(studioItems).where(eq(studioItems.id, id));

    await logAudit({
      userId: user.id,
      action: "studio_item.delete",
      entityType: "studio_item",
      entityId: String(id),
    });

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteStudioItemAction Error]:", error);
    return { success: false, error: "Failed to delete studio item." };
  }
}

export async function reorderStudioItemsAction(ids: number[]) {
  await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(studioItems)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(studioItems.id, id))
      )
    );

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");

    return { success: true };
  } catch (error) {
    console.error("[reorderStudioItemsAction Error]:", error);
    return { success: false, error: "Failed to reorder studio items." };
  }
}

export async function togglePublishStudioItemAction(
  id: number,
  published: boolean
) {
  await requireAuth();

  try {
    await db
      .update(studioItems)
      .set({ published, updatedAt: new Date() })
      .where(eq(studioItems.id, id));

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishStudioItemAction Error]:", error);
    return { success: false, error: "Failed to update publish state." };
  }
}

// ==========================================
// 4. BULK OPERATIONS
// ==========================================

export async function bulkCreateStudioItemsAction(data: StudioBulkItemInput) {
  const user = await requireAuth();

  const validated = studioBulkItemSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const inserted = await db
      .insert(studioItems)
      .values(
        validated.data.items.map((item, index) => ({
          ...item,
          order: index + 1,
          published: true,
        }))
      )
      .returning();

    await logAudit({
      userId: user.id,
      action: "studio_items.bulk_create",
      entityType: "studio_item",
      details: { count: inserted.length },
    });

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");
    revalidatePath("/");

    return { success: true, count: inserted.length };
  } catch (error) {
    console.error("[bulkCreateStudioItemsAction Error]:", error);
    return { success: false, error: "Failed to bulk create studio items." };
  }
}

export async function bulkUpdateStudioItemsCategoryAction(
  ids: number[],
  categoryId: number
) {
  await requireAuth();

  try {
    await db
      .update(studioItems)
      .set({ categoryId, updatedAt: new Date() })
      .where(inArray(studioItems.id, ids));

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");

    return { success: true };
  } catch (error) {
    console.error("[bulkUpdateStudioItemsCategoryAction Error]:", error);
    return { success: false, error: "Failed to update categories." };
  }
}

export async function bulkDeleteStudioItemsAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await db.delete(studioItems).where(inArray(studioItems.id, ids));

    await logAudit({
      userId: user.id,
      action: "studio_items.bulk_delete",
      entityType: "studio_item",
      details: { count: ids.length },
    });

    revalidateTag("studio_items");
    revalidatePath("/admin/studio");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[bulkDeleteStudioItemsAction Error]:", error);
    return { success: false, error: "Failed to bulk delete studio items." };
  }
}
