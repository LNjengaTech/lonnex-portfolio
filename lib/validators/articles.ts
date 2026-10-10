import { z } from "zod";

// ── Tag ──────────────────────────────────────────────────────────────────────

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export type TagInput = z.infer<typeof tagSchema>;

// ── Series ───────────────────────────────────────────────────────────────────

export const seriesSchema = z.object({
  title: z.string().min(1, "Series title is required").max(150),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(300).optional().nullable(),
  order: z.number().int().default(0),
});

export type SeriesInput = z.infer<typeof seriesSchema>;

// ── Article ──────────────────────────────────────────────────────────────────

export const articleStatusEnum = z.enum(["draft", "scheduled", "published"]);
export type ArticleStatus = z.infer<typeof articleStatusEnum>;

export const articleSeoSchema = z.object({
  title: z.string().max(70).optional().nullable(),
  description: z.string().max(160).optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  ogSection: z.string().max(80).optional().nullable(), // article:section (e.g. "Technology")
});

export const articleSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required").max(200),
  excerpt: z.string().min(1, "Excerpt is required").max(400),
  coverUrl: z.string().optional().nullable(),
  // Tiptap JSON stored as the serialisable object
  contentJson: z.record(z.string(), z.unknown()),
  htmlCache: z.string().optional().nullable(),
  seriesId: z.number().int().optional().nullable(),
  seriesPart: z.number().int().positive().optional().nullable(),
  status: articleStatusEnum.default("draft"),
  publishAt: z.string().optional().nullable(), // ISO string or null
  readingTime: z.number().int().positive().default(1),
  seo: articleSeoSchema.optional().nullable(),
  canonicalUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  tagIds: z.array(z.number().int()).default([]),
});

export type ArticleInput = z.infer<typeof articleSchema>;

// ── Import payload ────────────────────────────────────────────────────────────

export const importArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().default(""),
  contentJson: z.record(z.string(), z.unknown()),
  rawHtml: z.string().optional(),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().optional().nullable(),
});

export type ImportArticleInput = z.infer<typeof importArticleSchema>;
