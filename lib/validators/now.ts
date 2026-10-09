import { z } from "zod";

export const nowProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().min(1, "Description is required").max(500),
  progress: z.number().int().min(0).max(100),
  stack: z.array(z.string()).default([]),
  status: z.enum(["in_progress", "completed", "paused"]).default("in_progress"),
});

export type NowProjectInput = z.infer<typeof nowProjectSchema>;

export const buildLogEntrySchema = z.object({
  projectId: z.number().int().optional().nullable(),
  title: z.string().min(1, "Title is required").max(150),
  content: z.string().min(1, "Content is required").max(2000),
  logDate: z.coerce.date().default(() => new Date()),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type BuildLogEntryInput = z.infer<typeof buildLogEntrySchema>;
