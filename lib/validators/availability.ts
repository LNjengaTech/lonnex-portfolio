import { z } from "zod";

export const availabilitySchema = z.object({
  status: z.enum(["available", "limited", "booked"]),
  message: z.string().min(1, "Message is required").max(300),
  nextAvailableDate: z.string().max(100).optional().nullable(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
