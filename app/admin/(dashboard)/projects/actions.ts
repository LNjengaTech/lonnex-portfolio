"use server";

import { revalidatePath, revalidateTag } from "@/lib/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectMedia, projectStack } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  projectSchema,
  projectMediaInputSchema,
  type ProjectInput,
  type ProjectMediaInput,
} from "@/lib/validators/projects";

export async function createProjectAction(data: ProjectInput) {
  const user = await requireAuth();

  const validated = projectSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    slug,
    title,
    summary,
    role,
    year,
    client,
    status,
    category,
    tileSize,
    featured,
    confidential,
    order,
    coverMedia,
    previewVideo,
    liveUrl,
    repoUrl,
    problem,
    approach,
    result,
    metrics,
    seo,
    published,
    stack,
  } = validated.data;

  try {
    const [created] = await db
      .insert(projects)
      .values({
        slug,
        title,
        summary,
        role,
        year,
        client: client || null,
        status,
        category,
        tileSize,
        featured,
        order,
        coverMedia,
        previewVideo: previewVideo || null,
        liveUrl: liveUrl || null,
        repoUrl: repoUrl || null,
        problem,
        approach,
        result,
        metrics: {
          confidential,
          items: metrics,
        },
        seo: seo || null,
        published,
      })
      .returning();

    // Insert stack tags
    if (stack.length > 0) {
      await db.insert(projectStack).values(
        stack.map((name, idx) => ({
          projectId: created.id,
          name,
          order: idx + 1,
        }))
      );
    }

    await logAudit({
      userId: user.id,
      action: "project.create",
      entityType: "project",
      entityId: String(created.id),
      details: { title, slug },
    });

    revalidateTag("projects");
    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true, project: created };
  } catch (error: unknown) {
    console.error("[createProjectAction Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create project.";
    if (msg.includes("unique") || msg.includes("slug")) {
      return { success: false, error: "A project with this slug already exists." };
    }
    return { success: false, error: msg };
  }
}

export async function updateProjectAction(id: number, data: ProjectInput) {
  const user = await requireAuth();

  const validated = projectSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    slug,
    title,
    summary,
    role,
    year,
    client,
    status,
    category,
    tileSize,
    featured,
    confidential,
    order,
    coverMedia,
    previewVideo,
    liveUrl,
    repoUrl,
    problem,
    approach,
    result,
    metrics,
    seo,
    published,
    stack,
  } = validated.data;

  try {
    await db
      .update(projects)
      .set({
        slug,
        title,
        summary,
        role,
        year,
        client: client || null,
        status,
        category,
        tileSize,
        featured,
        order,
        coverMedia,
        previewVideo: previewVideo || null,
        liveUrl: liveUrl || null,
        repoUrl: repoUrl || null,
        problem,
        approach,
        result,
        metrics: {
          confidential,
          items: metrics,
        },
        seo: seo || null,
        published,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // Refresh stack tags
    await db.delete(projectStack).where(eq(projectStack.projectId, id));
    if (stack.length > 0) {
      await db.insert(projectStack).values(
        stack.map((name, idx) => ({
          projectId: id,
          name,
          order: idx + 1,
        }))
      );
    }

    await logAudit({
      userId: user.id,
      action: "project.update",
      entityType: "project",
      entityId: String(id),
      details: { title, slug },
    });

    revalidateTag("projects");
    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("[updateProjectAction Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update project.";
    return { success: false, error: msg };
  }
}

export async function deleteProjectAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(projects).where(eq(projects.id, id));

    await logAudit({
      userId: user.id,
      action: "project.delete",
      entityType: "project",
      entityId: String(id),
    });

    revalidateTag("projects");
    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteProjectAction Error]:", error);
    return { success: false, error: "Failed to delete project." };
  }
}

export async function reorderProjectsAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(projects)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(projects.id, id))
      )
    );

    revalidateTag("projects");
    revalidatePath("/admin/projects");

    return { success: true };
  } catch (error) {
    console.error("[reorderProjectsAction Error]:", error);
    return { success: false, error: "Failed to reorder projects." };
  }
}

export async function togglePublishProjectAction(id: number, published: boolean) {
  const user = await requireAuth();

  try {
    await db
      .update(projects)
      .set({ published, updatedAt: new Date() })
      .where(eq(projects.id, id));

    revalidateTag("projects");
    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishProjectAction Error]:", error);
    return { success: false, error: "Failed to update project publish status." };
  }
}

// Gallery Media Actions
export async function addProjectMediaAction(data: ProjectMediaInput) {
  const user = await requireAuth();

  const validated = projectMediaInputSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: "Invalid media payload." };
  }

  try {
    const [media] = await db
      .insert(projectMedia)
      .values(validated.data)
      .returning();

    revalidateTag("project_media");
    revalidatePath("/admin/projects");

    return { success: true, media };
  } catch (error) {
    console.error("[addProjectMediaAction Error]:", error);
    return { success: false, error: "Failed to add project media." };
  }
}

export async function deleteProjectMediaAction(id: number) {
  await requireAuth();

  try {
    await db.delete(projectMedia).where(eq(projectMedia.id, id));
    revalidateTag("project_media");
    return { success: true };
  } catch (error) {
    console.error("[deleteProjectMediaAction Error]:", error);
    return { success: false, error: "Failed to delete project media." };
  }
}
