"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validators/settings";

export async function updateSiteSettingsAction(data: SiteSettingsInput) {
  const user = await requireAuth();

  const validated = siteSettingsSchema.safeParse(data);
  if (!validated.success) {
    const errorMsg = validated.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg };
  }

  const {
    siteTitle,
    tagline,
    heroText,
    navLabels,
    seoDefaults,
    themeOptions,
    footerText,
    cvUrl,
  } = validated.data;

  try {
    await db
      .insert(siteSettings)
      .values({
        id: "singleton",
        siteTitle,
        tagline,
        heroText,
        navLabels,
        seoDefaults,
        themeOptions,
        footerText,
        cvUrl: cvUrl || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          siteTitle,
          tagline,
          heroText,
          navLabels,
          seoDefaults,
          themeOptions,
          footerText,
          cvUrl: cvUrl || null,
          updatedAt: new Date(),
        },
      });

    await logAudit({
      userId: user.id,
      action: "settings.update",
      entityType: "site_settings",
      entityId: "singleton",
      details: { siteTitle },
    });

    revalidateTag("site_settings");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateSiteSettingsAction Error]:", error);
    return { success: false, error: "Failed to update site settings." };
  }
}
