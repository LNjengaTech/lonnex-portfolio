import { getSiteSettings } from "@/lib/db/queries/settings";
import { getAvailability } from "@/lib/db/queries/availability";
import { getPublishedArticles } from "@/lib/db/queries/articles";
import { getPublishedProjects } from "@/lib/db/queries/public";
import { getContactMethodsList } from "@/lib/db/queries/contact";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import dynamic from "next/dynamic";
import { HexLoader } from "@/components/site/hex-loader";

const HexCursor = dynamic(
  () => import("@/components/site/hex-cursor").then((m) => m.HexCursor)
);
const CommandPalette = dynamic(
  () => import("@/components/site/command-palette").then((m) => m.CommandPalette)
);

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallel DB reads
  const [settings, availability, publishedProjects, publishedArticles, contactMethods] =
    await Promise.all([
      getSiteSettings(),
      getAvailability(),
      getPublishedProjects(),
      getPublishedArticles(),
      getContactMethodsList(false), // published only
    ]);

  const navLabels =
    (settings.navLabels as Record<string, string> | null) ?? {};

  // Build command palette data
  const projectCommands = publishedProjects.map((p) => ({
    label: p.title,
    href: `/work/${p.slug}`,
    group: "Projects",
  }));

  const articleCommands = publishedArticles.map((a) => ({
    label: a.title,
    href: `/journal/${a.slug}`,
    group: "Articles",
  }));

  const tagline =
    typeof settings.tagline === "string" ? settings.tagline : "The Hive";
  const footerText =
    typeof settings.footerText === "string"
      ? settings.footerText
      : "© 2026 Lonnex Njenga. All rights reserved.";

  return (
    <div className="flex min-h-screen flex-col">
      {/* First-visit intro loader */}
      <HexLoader tagline={tagline} />

      {/* Custom hex cursor — desktop only */}
      <HexCursor />

      {/* Command palette — Cmd/K */}
      <CommandPalette
        projects={projectCommands}
        articles={articleCommands}
      />

      {/* Skip to content — keyboard accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <SiteHeader
        availabilityStatus={availability.status as "available" | "limited" | "booked"}
        navLabels={navLabels}
      />

      {/* Page content — padded below fixed header */}
      <main id="main-content" className="flex-1 pt-14">
        {children}
      </main>

      <SiteFooter
        footerText={footerText}
        tagline={tagline === "The Hive"
          ? "More than code. It's a vision."
          : tagline}
        contactMethods={contactMethods}
      />
    </div>
  );
}
