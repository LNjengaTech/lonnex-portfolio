import { z } from "zod";

export const photoCropsSchema = z.object({
  zoom: z.number().min(0.5).max(3).default(1),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
}).optional().nullable();

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  shortBio: z.string().min(1, "Short bio is required").max(300),
  longBio: z.string().min(1, "Long bio is required").max(2000),
  photoUrl: z.string().min(1, "Photo URL is required"),
  photoCrops: photoCropsSchema,
  location: z.string().min(1, "Location is required").max(100),
  timezone: z.string().min(1, "Timezone is required").max(100),
});

export type ProfileInput = z.infer<typeof profileSchema>;
