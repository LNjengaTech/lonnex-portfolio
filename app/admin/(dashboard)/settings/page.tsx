import { requireAuth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { getAllMediaAssets } from "@/lib/db/queries/media";
import { SettingsClientForm } from "./settings-client-form";
import type { SiteSettingsInput } from "@/lib/validators/settings";

export default async function AdminSettingsPage() {
  await requireAuth();

  const settings = await getSiteSettings();
  const media = await getAllMediaAssets();

  const formattedSettings: SiteSettingsInput = {
    siteTitle: settings.siteTitle,
    tagline: settings.tagline,
    heroText: settings.heroText,
    navLabels: settings.navLabels as SiteSettingsInput["navLabels"],
    seoDefaults: settings.seoDefaults as SiteSettingsInput["seoDefaults"],
    themeOptions: settings.themeOptions as SiteSettingsInput["themeOptions"],
    footerText: settings.footerText,
    cvUrl: settings.cvUrl,
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Site Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure site metadata, brand identity, navigation labels, and global defaults.
        </p>
      </div>

      <SettingsClientForm
        initialSettings={formattedSettings}
        mediaAssets={media}
      />
    </div>
  );
}
