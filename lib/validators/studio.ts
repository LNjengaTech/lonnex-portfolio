import { z } from "zod";

export const studioCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type StudioCategoryInput = z.infer<typeof studioCategorySchema>;

export const studioCollectionSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type StudioCollectionInput = z.infer<typeof studioCollectionSchema>;

export const studioItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  categoryId: z.number().int({ message: "Category is required" }),
  collectionId: z.number().int().optional().nullable(),
  mediaType: z.enum(["image", "video"]).default("image"),
  mediaUrl: z.string().min(1, "Media URL is required"),
  cloudinaryId: z.string().min(1, "Cloudinary ID is required"),
  width: z.number().int().positive().default(1000),
  height: z.number().int().positive().default(1000),
  ratio: z.string().default("1:1"), // "16:9", "1:1", "1:3", "9:16", "4:3", etc.
  specLabel: z.string().min(1, "Specification label is required").max(100),
  year: z.string().min(1, "Year is required").max(20),
  confidential: z.boolean().default(false),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type StudioItemInput = z.infer<typeof studioItemSchema>;

export const studioBulkItemSchema = z.object({
  items: z.array(
    z.object({
      title: z.string().min(1),
      categoryId: z.number().int(),
      collectionId: z.number().int().optional().nullable(),
      mediaType: z.enum(["image", "video"]).default("image"),
      mediaUrl: z.string().min(1),
      cloudinaryId: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      ratio: z.string(),
      specLabel: z.string().min(1),
      year: z.string().min(1),
      confidential: z.boolean().default(false),
    })
  ),
});

export type StudioBulkItemInput = z.infer<typeof studioBulkItemSchema>;
