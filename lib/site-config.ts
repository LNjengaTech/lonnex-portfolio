/**
 * Site constants and default configuration.
 * Single source of truth for site-wide constants.
 * Note: Dynamic content is loaded from the database; these serve as fallbacks and structural config.
 */

export const siteConfig = {
  name: "Lonnex Njenga",
  title: "Lonnex Njenga — Web Developer & Graphic Designer",
  tagline: "The Hive",
  description:
    "Portfolio of Lonnex Njenga: web/cross-platform developer and commercial graphic designer.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lonnex.dev",
  navItems: [
    { label: "Work", href: "/work" },
    { label: "Studio", href: "/studio" },
    { label: "Journal", href: "/journal" },
    { label: "About", href: "/about" },
    { label: "Now", href: "/now" },
    { label: "Contact", href: "/contact" },
  ],
  theme: {
    defaultTheme: "system",
    storageKey: "theme",
  },
} as const;

export type SiteConfig = typeof siteConfig;
