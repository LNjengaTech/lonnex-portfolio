import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { skillCategories, skills } from "@/lib/db/schema";

export async function getSkillCategories(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(skillCategories)
        .orderBy(asc(skillCategories.order), asc(skillCategories.id));
    }

    return await db
      .select()
      .from(skillCategories)
      .where(eq(skillCategories.published, true))
      .orderBy(asc(skillCategories.order), asc(skillCategories.id));
  } catch (error) {
    console.error("[getSkillCategories Error]:", error);
    return [];
  }
}

export async function getSkills(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(skills)
        .orderBy(asc(skills.order), asc(skills.id));
    }

    return await db
      .select()
      .from(skills)
      .where(eq(skills.published, true))
      .orderBy(asc(skills.order), asc(skills.id));
  } catch (error) {
    console.error("[getSkills Error]:", error);
    return [];
  }
}

export type SkillCategoryWithSkills = typeof skillCategories.$inferSelect & {
  skills: (typeof skills.$inferSelect)[];
};

export async function getSkillCategoriesWithSkills(
  includeUnpublished = true
): Promise<SkillCategoryWithSkills[]> {
  try {
    const categories = await getSkillCategories(includeUnpublished);
    const allSkills = await getSkills(includeUnpublished);

    return categories.map((cat) => ({
      ...cat,
      skills: allSkills.filter((s) => s.categoryId === cat.id),
    }));
  } catch (error) {
    console.error("[getSkillCategoriesWithSkills Error]:", error);
    return [];
  }
}
