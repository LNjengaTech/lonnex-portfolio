import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export async function getSiteSettings() {
  try {
    const records = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "singleton"))
      .limit(1);

    if (records.length > 0) {
      return records[0];
    }
  } catch (error) {
    console.error("[getSiteSettings Error]:", error);
  }

  // Fallback defaults matching Blueprint
  return {
    id: "singleton",
    siteTitle: "Lonnex Njenga — The Hive",
    tagline: "The Hive",
    heroText:
      "Full-stack cross-platform developer and commercial graphic designer architecting bold digital systems.",
    navLabels: {
      work: "Work",
      studio: "Studio",
      journal: "Journal",
      about: "About",
      now: "Now",
      contact: "Contact",
    },
    seoDefaults: {
      title: "Lonnex Njenga — Web Developer & Graphic Designer",
      description:
        "Portfolio and studio of Lonnex Njenga: Full-stack applications and commercial graphics.",
    },
    themeOptions: {
      defaultTheme: "system" as const,
      allowUserToggle: true,
    },
    footerText: "© 2026 Lonnex Njenga. All rights reserved.",
    cvUrl: null,
    updatedAt: new Date(),
  };
}
