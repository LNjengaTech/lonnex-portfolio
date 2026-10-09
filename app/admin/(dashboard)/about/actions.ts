"use server";

import { revalidatePath, revalidateTag } from "@/lib/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  profile,
  skillCategories,
  skills,
  experience,
  services,
  testimonials,
} from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { profileSchema, type ProfileInput } from "@/lib/validators/profile";
import {
  skillCategorySchema,
  skillSchema,
  type SkillCategoryInput,
  type SkillInput,
} from "@/lib/validators/skills";
import {
  experienceSchema,
  type ExperienceInput,
} from "@/lib/validators/experience";
import { serviceSchema, type ServiceInput } from "@/lib/validators/services";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validators/testimonials";

// ==========================================
// 1. PROFILE ACTIONS
// ==========================================

export async function updateProfileAction(data: ProfileInput) {
  const user = await requireAuth();

  const validated = profileSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const { name, shortBio, longBio, photoUrl, photoCrops, location, timezone } =
    validated.data;

  try {
    await db
      .insert(profile)
      .values({
        id: "singleton",
        name,
        shortBio,
        longBio,
        photoUrl,
        photoCrops: photoCrops || null,
        location,
        timezone,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profile.id,
        set: {
          name,
          shortBio,
          longBio,
          photoUrl,
          photoCrops: photoCrops || null,
          location,
          timezone,
          updatedAt: new Date(),
        },
      });

    await logAudit({
      userId: user.id,
      action: "profile.update",
      entityType: "profile",
      entityId: "singleton",
      details: { name },
    });

    revalidateTag("profile");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateProfileAction Error]:", error);
    return { success: false, error: "Failed to update profile." };
  }
}

// ==========================================
// 2. SKILL CATEGORIES ACTIONS
// ==========================================

export async function createSkillCategoryAction(data: SkillCategoryInput) {
  const user = await requireAuth();

  const validated = skillCategorySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [cat] = await db
      .insert(skillCategories)
      .values({
        name: validated.data.name,
        icon: validated.data.icon,
        order: validated.data.order,
        published: validated.data.published,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "skill_category.create",
      entityType: "skill_category",
      entityId: String(cat.id),
      details: { name: cat.name },
    });

    revalidateTag("skill_categories");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true, category: cat };
  } catch (error) {
    console.error("[createSkillCategoryAction Error]:", error);
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateSkillCategoryAction(
  id: number,
  data: SkillCategoryInput
) {
  const user = await requireAuth();

  const validated = skillCategorySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(skillCategories)
      .set({
        name: validated.data.name,
        icon: validated.data.icon,
        order: validated.data.order,
        published: validated.data.published,
        updatedAt: new Date(),
      })
      .where(eq(skillCategories.id, id));

    await logAudit({
      userId: user.id,
      action: "skill_category.update",
      entityType: "skill_category",
      entityId: String(id),
      details: { name: validated.data.name },
    });

    revalidateTag("skill_categories");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateSkillCategoryAction Error]:", error);
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteSkillCategoryAction(id: number) {
  const user = await requireAuth();

  try {
    // Delete skills under category first
    await db.delete(skills).where(eq(skills.categoryId, id));
    await db.delete(skillCategories).where(eq(skillCategories.id, id));

    await logAudit({
      userId: user.id,
      action: "skill_category.delete",
      entityType: "skill_category",
      entityId: String(id),
    });

    revalidateTag("skill_categories");
    revalidateTag("skills");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteSkillCategoryAction Error]:", error);
    return { success: false, error: "Failed to delete category." };
  }
}

export async function reorderSkillCategoriesAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(skillCategories)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(skillCategories.id, id))
      )
    );

    await logAudit({
      userId: user.id,
      action: "skill_category.reorder",
      entityType: "skill_category",
      details: { count: ids.length },
    });

    revalidateTag("skill_categories");
    revalidatePath("/admin/about");

    return { success: true };
  } catch (error) {
    console.error("[reorderSkillCategoriesAction Error]:", error);
    return { success: false, error: "Failed to reorder categories." };
  }
}

// ==========================================
// 3. SKILLS ACTIONS
// ==========================================

export async function createSkillAction(data: SkillInput) {
  const user = await requireAuth();

  const validated = skillSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [newSkill] = await db
      .insert(skills)
      .values({
        categoryId: validated.data.categoryId,
        name: validated.data.name,
        icon: validated.data.icon,
        tier: validated.data.tier,
        years: validated.data.years,
        order: validated.data.order,
        published: validated.data.published,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "skill.create",
      entityType: "skill",
      entityId: String(newSkill.id),
      details: { name: newSkill.name },
    });

    revalidateTag("skills");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true, skill: newSkill };
  } catch (error) {
    console.error("[createSkillAction Error]:", error);
    return { success: false, error: "Failed to create skill." };
  }
}

export async function updateSkillAction(id: number, data: SkillInput) {
  const user = await requireAuth();

  const validated = skillSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(skills)
      .set({
        categoryId: validated.data.categoryId,
        name: validated.data.name,
        icon: validated.data.icon,
        tier: validated.data.tier,
        years: validated.data.years,
        order: validated.data.order,
        published: validated.data.published,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, id));

    await logAudit({
      userId: user.id,
      action: "skill.update",
      entityType: "skill",
      entityId: String(id),
      details: { name: validated.data.name },
    });

    revalidateTag("skills");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateSkillAction Error]:", error);
    return { success: false, error: "Failed to update skill." };
  }
}

export async function moveSkillToCategoryAction(
  skillId: number,
  targetCategoryId: number,
  newOrder: number
) {
  const user = await requireAuth();

  try {
    await db
      .update(skills)
      .set({
        categoryId: targetCategoryId,
        order: newOrder,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId));

    await logAudit({
      userId: user.id,
      action: "skill.move_category",
      entityType: "skill",
      entityId: String(skillId),
      details: { targetCategoryId, newOrder },
    });

    revalidateTag("skills");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[moveSkillToCategoryAction Error]:", error);
    return { success: false, error: "Failed to move skill category." };
  }
}

export async function deleteSkillAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(skills).where(eq(skills.id, id));

    await logAudit({
      userId: user.id,
      action: "skill.delete",
      entityType: "skill",
      entityId: String(id),
    });

    revalidateTag("skills");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteSkillAction Error]:", error);
    return { success: false, error: "Failed to delete skill." };
  }
}

export async function reorderSkillsAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(skills)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(skills.id, id))
      )
    );

    await logAudit({
      userId: user.id,
      action: "skill.reorder",
      entityType: "skill",
      details: { count: ids.length },
    });

    revalidateTag("skills");
    revalidatePath("/admin/about");

    return { success: true };
  } catch (error) {
    console.error("[reorderSkillsAction Error]:", error);
    return { success: false, error: "Failed to reorder skills." };
  }
}

export async function togglePublishSkillAction(id: number, published: boolean) {
  const user = await requireAuth();

  try {
    await db
      .update(skills)
      .set({ published, updatedAt: new Date() })
      .where(eq(skills.id, id));

    revalidateTag("skills");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishSkillAction Error]:", error);
    return { success: false, error: "Failed to toggle skill publish." };
  }
}

// ==========================================
// 4. EXPERIENCE ACTIONS
// ==========================================

export async function createExperienceAction(data: ExperienceInput) {
  const user = await requireAuth();

  const validated = experienceSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [item] = await db
      .insert(experience)
      .values({
        role: validated.data.role,
        org: validated.data.org,
        dates: validated.data.dates,
        description: validated.data.description,
        type: validated.data.type,
        order: validated.data.order,
        published: validated.data.published,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "experience.create",
      entityType: "experience",
      entityId: String(item.id),
      details: { role: item.role, org: item.org },
    });

    revalidateTag("experience");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true, item };
  } catch (error) {
    console.error("[createExperienceAction Error]:", error);
    return { success: false, error: "Failed to create experience item." };
  }
}

export async function updateExperienceAction(
  id: number,
  data: ExperienceInput
) {
  const user = await requireAuth();

  const validated = experienceSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(experience)
      .set({
        role: validated.data.role,
        org: validated.data.org,
        dates: validated.data.dates,
        description: validated.data.description,
        type: validated.data.type,
        order: validated.data.order,
        published: validated.data.published,
        updatedAt: new Date(),
      })
      .where(eq(experience.id, id));

    await logAudit({
      userId: user.id,
      action: "experience.update",
      entityType: "experience",
      entityId: String(id),
      details: { role: validated.data.role },
    });

    revalidateTag("experience");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateExperienceAction Error]:", error);
    return { success: false, error: "Failed to update experience item." };
  }
}

export async function deleteExperienceAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(experience).where(eq(experience.id, id));

    await logAudit({
      userId: user.id,
      action: "experience.delete",
      entityType: "experience",
      entityId: String(id),
    });

    revalidateTag("experience");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteExperienceAction Error]:", error);
    return { success: false, error: "Failed to delete experience item." };
  }
}

export async function reorderExperienceAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(experience)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(experience.id, id))
      )
    );

    revalidateTag("experience");
    revalidatePath("/admin/about");

    return { success: true };
  } catch (error) {
    console.error("[reorderExperienceAction Error]:", error);
    return { success: false, error: "Failed to reorder experience." };
  }
}

export async function togglePublishExperienceAction(
  id: number,
  published: boolean
) {
  const user = await requireAuth();

  try {
    await db
      .update(experience)
      .set({ published, updatedAt: new Date() })
      .where(eq(experience.id, id));

    revalidateTag("experience");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishExperienceAction Error]:", error);
    return { success: false, error: "Failed to toggle experience publish." };
  }
}

// ==========================================
// 5. SERVICES ACTIONS
// ==========================================

export async function createServiceAction(data: ServiceInput) {
  const user = await requireAuth();

  const validated = serviceSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [srv] = await db
      .insert(services)
      .values({
        title: validated.data.title,
        description: validated.data.description,
        deliverables: validated.data.deliverables,
        priceFrom: validated.data.priceFrom,
        timeline: validated.data.timeline,
        icon: validated.data.icon,
        order: validated.data.order,
        published: validated.data.published,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "service.create",
      entityType: "service",
      entityId: String(srv.id),
      details: { title: srv.title },
    });

    revalidateTag("services");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true, service: srv };
  } catch (error) {
    console.error("[createServiceAction Error]:", error);
    return { success: false, error: "Failed to create service." };
  }
}

export async function updateServiceAction(id: number, data: ServiceInput) {
  const user = await requireAuth();

  const validated = serviceSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(services)
      .set({
        title: validated.data.title,
        description: validated.data.description,
        deliverables: validated.data.deliverables,
        priceFrom: validated.data.priceFrom,
        timeline: validated.data.timeline,
        icon: validated.data.icon,
        order: validated.data.order,
        published: validated.data.published,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id));

    await logAudit({
      userId: user.id,
      action: "service.update",
      entityType: "service",
      entityId: String(id),
      details: { title: validated.data.title },
    });

    revalidateTag("services");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateServiceAction Error]:", error);
    return { success: false, error: "Failed to update service." };
  }
}

export async function deleteServiceAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(services).where(eq(services.id, id));

    await logAudit({
      userId: user.id,
      action: "service.delete",
      entityType: "service",
      entityId: String(id),
    });

    revalidateTag("services");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteServiceAction Error]:", error);
    return { success: false, error: "Failed to delete service." };
  }
}

export async function reorderServicesAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(services)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(services.id, id))
      )
    );

    revalidateTag("services");
    revalidatePath("/admin/about");

    return { success: true };
  } catch (error) {
    console.error("[reorderServicesAction Error]:", error);
    return { success: false, error: "Failed to reorder services." };
  }
}

export async function togglePublishServiceAction(
  id: number,
  published: boolean
) {
  const user = await requireAuth();

  try {
    await db
      .update(services)
      .set({ published, updatedAt: new Date() })
      .where(eq(services.id, id));

    revalidateTag("services");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishServiceAction Error]:", error);
    return { success: false, error: "Failed to toggle service publish." };
  }
}

// ==========================================
// 6. TESTIMONIALS ACTIONS
// ==========================================

export async function createTestimonialAction(data: TestimonialInput) {
  const user = await requireAuth();

  const validated = testimonialSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const [t] = await db
      .insert(testimonials)
      .values({
        quote: validated.data.quote,
        name: validated.data.name,
        role: validated.data.role,
        photoUrl: validated.data.photoUrl || null,
        projectId: validated.data.projectId || null,
        order: validated.data.order,
        published: validated.data.published,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "testimonial.create",
      entityType: "testimonial",
      entityId: String(t.id),
      details: { name: t.name },
    });

    revalidateTag("testimonials");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true, testimonial: t };
  } catch (error) {
    console.error("[createTestimonialAction Error]:", error);
    return { success: false, error: "Failed to create testimonial." };
  }
}

export async function updateTestimonialAction(
  id: number,
  data: TestimonialInput
) {
  const user = await requireAuth();

  const validated = testimonialSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await db
      .update(testimonials)
      .set({
        quote: validated.data.quote,
        name: validated.data.name,
        role: validated.data.role,
        photoUrl: validated.data.photoUrl || null,
        projectId: validated.data.projectId || null,
        order: validated.data.order,
        published: validated.data.published,
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, id));

    await logAudit({
      userId: user.id,
      action: "testimonial.update",
      entityType: "testimonial",
      entityId: String(id),
      details: { name: validated.data.name },
    });

    revalidateTag("testimonials");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateTestimonialAction Error]:", error);
    return { success: false, error: "Failed to update testimonial." };
  }
}

export async function deleteTestimonialAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));

    await logAudit({
      userId: user.id,
      action: "testimonial.delete",
      entityType: "testimonial",
      entityId: String(id),
    });

    revalidateTag("testimonials");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteTestimonialAction Error]:", error);
    return { success: false, error: "Failed to delete testimonial." };
  }
}

export async function reorderTestimonialsAction(ids: number[]) {
  const user = await requireAuth();

  try {
    await Promise.all(
      ids.map((id, index) =>
        db
          .update(testimonials)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(testimonials.id, id))
      )
    );

    revalidateTag("testimonials");
    revalidatePath("/admin/about");

    return { success: true };
  } catch (error) {
    console.error("[reorderTestimonialsAction Error]:", error);
    return { success: false, error: "Failed to reorder testimonials." };
  }
}

export async function togglePublishTestimonialAction(
  id: number,
  published: boolean
) {
  const user = await requireAuth();

  try {
    await db
      .update(testimonials)
      .set({ published, updatedAt: new Date() })
      .where(eq(testimonials.id, id));

    revalidateTag("testimonials");
    revalidatePath("/admin/about");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[togglePublishTestimonialAction Error]:", error);
    return { success: false, error: "Failed to toggle testimonial publish." };
  }
}
