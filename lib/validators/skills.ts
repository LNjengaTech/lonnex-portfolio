import { z } from "zod";

export const skillCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  icon: z.string().min(1, "Icon name is required").max(50).default("Folder"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;

export const skillSchema = z.object({
  categoryId: z.number().int({ message: "Category ID is required" }),
  name: z.string().min(1, "Skill name is required").max(100),
  icon: z.string().min(1, "Icon name is required").max(50).default("Code2"),
  tier: z.enum(["primary", "secondary", "familiar"]).default("primary"),
  years: z.number().int().min(0).max(50).default(1),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type SkillInput = z.infer<typeof skillSchema>;
