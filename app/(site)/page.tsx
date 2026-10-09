import { HiveHome } from "@/components/site/hive-home";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { getProfile } from "@/lib/db/queries/profile";
import { getAvailability } from "@/lib/db/queries/availability";
import { getNowProject } from "@/lib/db/queries/now";
import {
  getPublishedProjects,
  getPublishedStudioCount,
  getPublishedArticleCount,
  getLatestPublishedArticle,
} from "@/lib/db/queries/public";

export const revalidate = 60; // ISR — revalidate every 60s (tag-based also works)

export default async function HomePage() {
  const [settings, profile, availability, nowProject, projects, studioCount, articleCount, latestArticle] =
    await Promise.all([
      getSiteSettings(),
      getProfile(),
      getAvailability(),
      getNowProject(),
      getPublishedProjects(),
      getPublishedStudioCount(),
      getPublishedArticleCount(),
      getLatestPublishedArticle(),
    ]);

  const heroText =
    typeof settings.heroText === "string"
      ? settings.heroText
      : "Full-stack cross-platform developer and commercial graphic designer architecting bold digital systems.";

  return (
    <HiveHome
      profileName={profile.name}
      profilePhotoUrl={profile.photoUrl ?? null}
      heroText={heroText}
      availabilityStatus={availability.status as "available" | "limited" | "booked"}
      availabilityMessage={availability.message ?? undefined}
      latestArticleTitle={latestArticle?.title ?? null}
      activeProjectName={nowProject?.title ?? null}
      studioCount={studioCount}
      projectCount={projects.length}
      articleCount={articleCount}
    />
  );
}
