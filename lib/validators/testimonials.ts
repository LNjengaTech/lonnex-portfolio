import { z } from "zod";

export const testimonialSchema = z.object({
  quote: z.string().min(1, "Quote is required").max(1000),
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role/Organization is required").max(150),
  photoUrl: z.string().optional().nullable(),
  projectId: z.number().int().optional().nullable(),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
