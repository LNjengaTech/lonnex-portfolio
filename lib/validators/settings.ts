import { z } from "zod";

export const siteSettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required").max(100),
  tagline: z.string().min(1, "Tagline is required").max(100),
  heroText: z.string().min(1, "Hero text is required").max(500),
  navLabels: z.object({
    work: z.string().min(1, "Work label is required"),
    studio: z.string().min(1, "Studio label is required"),
    journal: z.string().min(1, "Journal label is required"),
    about: z.string().min(1, "About label is required"),
    now: z.string().min(1, "Now label is required"),
    contact: z.string().min(1, "Contact label is required"),
  }),
  seoDefaults: z.object({
    title: z.string().min(1, "Default SEO title is required"),
    description: z.string().min(1, "Default SEO description is required"),
  }),
  themeOptions: z.object({
    defaultTheme: z.enum(["system", "light", "dark"]),
    allowUserToggle: z.boolean(),
  }),
  footerText: z.string().min(1, "Footer text is required").max(200),
  cvUrl: z.string().nullable().optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
