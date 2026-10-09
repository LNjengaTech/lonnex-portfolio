import { asc, desc, eq, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { studioCategories, studioCollections, studioItems } from "@/lib/db/schema";

export async function getStudioCategories(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(studioCategories)
        .orderBy(asc(studioCategories.order), asc(studioCategories.id));
    }

    return await db
      .select()
      .from(studioCategories)
      .where(eq(studioCategories.published, true))
      .orderBy(asc(studioCategories.order), asc(studioCategories.id));
  } catch (error) {
    console.error("[getStudioCategories Error]:", error);
    return [];
  }
}

export async function getStudioCollections(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(studioCollections)
        .orderBy(asc(studioCollections.order), asc(studioCollections.id));
    }

    return await db
      .select()
      .from(studioCollections)
      .where(eq(studioCollections.published, true))
      .orderBy(asc(studioCollections.order), asc(studioCollections.id));
  } catch (error) {
    console.error("[getStudioCollections Error]:", error);
    return [];
  }
}

export async function getStudioItems(
  includeUnpublished = true,
  categoryId?: number,
  collectionId?: number
) {
  try {
    const conditions = [];

    if (!includeUnpublished) {
      conditions.push(eq(studioItems.published, true));
    }
    if (categoryId) {
      conditions.push(eq(studioItems.categoryId, categoryId));
    }
    if (collectionId) {
      conditions.push(eq(studioItems.collectionId, collectionId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(studioItems)
      .where(whereClause)
      .orderBy(asc(studioItems.order), desc(studioItems.id));
  } catch (error) {
    console.error("[getStudioItems Error]:", error);
    return [];
  }
}

export async function getStudioItemById(id: number) {
  try {
    const rows = await db
      .select()
      .from(studioItems)
      .where(eq(studioItems.id, id))
      .limit(1);

    return rows[0] || null;
  } catch (error) {
    console.error("[getStudioItemById Error]:", error);
    return null;
  }
}

// ── Public cached queries (used by /studio server page) ─────────────────────

export const getPublishedStudioCategories = unstable_cache(
  async () => getStudioCategories(false),
  ["public-studio-categories"],
  { tags: ["studio_categories"], revalidate: 3600 }
);

export const getPublishedStudioCollections = unstable_cache(
  async () => getStudioCollections(false),
  ["public-studio-collections"],
  { tags: ["studio_collections"], revalidate: 3600 }
);

export const getPublishedStudioItems = unstable_cache(
  async () => getStudioItems(false),
  ["public-studio-items"],
  { tags: ["studio_items"], revalidate: 3600 }
);
