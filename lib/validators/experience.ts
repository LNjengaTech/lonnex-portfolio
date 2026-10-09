import { z } from "zod";

export const experienceSchema = z.object({
  role: z.string().min(1, "Role title is required").max(150),
  org: z.string().min(1, "Organization is required").max(150),
  dates: z.string().min(1, "Dates/Timeframe is required").max(100),
  description: z.string().min(1, "Description is required").max(2000),
  type: z.enum(["work", "education"]).default("work"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
