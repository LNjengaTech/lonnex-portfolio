import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectMedia, projectStack } from "@/lib/db/schema";

export async function getProjectsList(includeUnpublished = true) {
  try {
    const list = includeUnpublished
      ? await db
          .select()
          .from(projects)
          .orderBy(asc(projects.order), desc(projects.id))
      : await db
          .select()
          .from(projects)
          .where(eq(projects.published, true))
          .orderBy(asc(projects.order), desc(projects.id));

    // Attach stack tags
    const allStacks = await db
      .select()
      .from(projectStack)
      .orderBy(asc(projectStack.order));

    return list.map((p) => {
      const pMetrics = (p.metrics as Record<string, unknown>) || {};
      return {
        ...p,
        confidential: Boolean(pMetrics.confidential),
        metricsItems: Array.isArray(pMetrics.items)
          ? (pMetrics.items as Array<{ label: string; value: string }>)
          : [],
        stack: allStacks
          .filter((s) => s.projectId === p.id)
          .map((s) => s.name),
      };
    });
  } catch (error) {
    console.error("[getProjectsList Error]:", error);
    return [];
  }
}

export async function getProjectById(id: number) {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!rows.length) return null;
    const p = rows[0];

    const media = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, id))
      .orderBy(asc(projectMedia.order));

    const stack = await db
      .select()
      .from(projectStack)
      .where(eq(projectStack.projectId, id))
      .orderBy(asc(projectStack.order));

    const pMetrics = (p.metrics as Record<string, unknown>) || {};

    return {
      ...p,
      confidential: Boolean(pMetrics.confidential),
      metricsItems: Array.isArray(pMetrics.items)
        ? (pMetrics.items as Array<{ label: string; value: string }>)
        : [],
      media,
      stack: stack.map((s) => s.name),
    };
  } catch (error) {
    console.error("[getProjectById Error]:", error);
    return null;
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!rows.length) return null;
    return await getProjectById(rows[0].id);
  } catch (error) {
    console.error("[getProjectBySlug Error]:", error);
    return null;
  }
}

export async function getProjectMedia(projectId: number) {
  try {
    return await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectId))
      .orderBy(asc(projectMedia.order));
  } catch (error) {
    console.error("[getProjectMedia Error]:", error);
    return [];
  }
}
