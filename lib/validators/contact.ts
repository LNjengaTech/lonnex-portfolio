import { z } from "zod";

export const contactMethodSchema = z.object({
  type: z.enum([
    "email",
    "github",
    "linkedin",
    "x",
    "telegram",
    "phone",
    "whatsapp",
    "cal",
  ]),
  label: z.string().min(1, "Label is required").max(100),
  value: z.string().min(1, "Value / Link / Handle is required").max(200),
  icon: z.string().min(1, "Icon name is required").max(50).default("Mail"),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type ContactMethodInput = z.infer<typeof contactMethodSchema>;

export const messageStatusSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});

export type MessageStatusInput = z.infer<typeof messageStatusSchema>;
