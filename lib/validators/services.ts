import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(1, "Service title is required").max(150),
  description: z.string().min(1, "Description is required").max(1000),
  deliverables: z.array(z.string()).min(1, "At least one deliverable is required"),
  priceFrom: z.string().min(1, "Starting price is required").max(100),
  timeline: z.string().min(1, "Timeline is required").max(100),
  icon: z.string().min(1, "Icon name is required").max(50).default("Sparkles"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
