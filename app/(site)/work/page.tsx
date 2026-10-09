import type { Metadata } from "next";
import { getPublishedProjectsWithDetails } from "@/lib/db/queries/projects";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { WorkPageClient } from "@/components/site/work-page-client";

export const revalidate = 3600; // Tag-based cache with 1h ISR fallback

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle =
    typeof settings.siteTitle === "string" ? settings.siteTitle : "Lonnex Njenga";

  return {
    title: `Work — The Honeycomb Wall | ${siteTitle}`,
    description:
      "Explore code projects, engineering systems, and digital architectures in a hexagonal mosaic wall.",
  };
}

export default async function WorkPage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjectsWithDetails(),
    getSiteSettings(),
  ]);

  const navLabels = (settings.navLabels as Record<string, string> | null) ?? {};
  const pageTitle = navLabels.work || "The Honeycomb Wall";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WorkPageClient
        projects={projects}
        title={pageTitle}
        description="Engineering systems, cross-platform apps, and digital architectures packed by importance."
      />
    </div>
  );
}
