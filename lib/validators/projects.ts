import { z } from "zod";

export const mediaItemSchema = z.object({
  publicId: z.string().min(1, "Cloudinary public ID is required"),
  url: z.string().min(1, "URL is required"),
  width: z.number().int().positive().default(800),
  height: z.number().int().positive().default(600),
  format: z.string().default("jpg"),
  dominantColor: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required").max(150),
  summary: z.string().min(1, "Summary is required").max(300),
  role: z.string().min(1, "Role is required").max(100),
  year: z.string().min(1, "Year is required").max(20),
  client: z.string().max(100).optional().nullable(),
  status: z.enum(["completed", "in_progress", "archived"]).default("completed"),
  category: z.enum(["web", "mobile", "systems", "open_source"]).default("web"),
  tileSize: z.enum(["S", "M", "L", "XL"]).default("M"),
  featured: z.boolean().default(false),
  confidential: z.boolean().default(false),
  order: z.number().int().default(0),
  coverMedia: mediaItemSchema,
  previewVideo: z
    .object({
      publicId: z.string().min(1),
      url: z.string().min(1),
      width: z.number().int().default(1920),
      height: z.number().int().default(1080),
    })
    .optional()
    .nullable(),
  liveUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  repoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  problem: z.string().min(1, "Problem description is required"),
  approach: z.string().min(1, "Approach description is required"),
  result: z.string().min(1, "Result description is required"),
  metrics: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .default([]),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional()
    .nullable(),
  published: z.boolean().default(true),
  stack: z.array(z.string()).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectMediaInputSchema = z.object({
  projectId: z.number().int(),
  mediaType: z.enum(["image", "video"]).default("image"),
  cloudinaryId: z.string().min(1),
  url: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().max(200).optional().nullable(),
  order: z.number().int().default(0),
});

export type ProjectMediaInput = z.infer<typeof projectMediaInputSchema>;
