import { asc, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { projects, studioItems, articles } from "@/lib/db/schema";
import { getProfile } from "./profile";
import { getSkillCategoriesWithSkills } from "./skills";
import { getExperienceList } from "./experience";
import { getServicesList } from "./services";
import { getTestimonialsList } from "./testimonials";
import { getAvailability } from "./availability";
import { getNowProject, getBuildLogEntries } from "./now";
import { getContactMethodsList } from "./contact";
import { getSiteSettings } from "./settings";

/**
 * Cached public reads used by the public site shell and rooms.
 * All reads are tag-based; admin mutations call revalidateTag() to bust these.
 */

export const getPublishedProjects = unstable_cache(
  async () => {
    try {
      return await db
        .select()
        .from(projects)
        .where(eq(projects.published, true))
        .orderBy(asc(projects.order), desc(projects.id));
    } catch {
      return [];
    }
  },
  ["public-projects"],
  { tags: ["projects"] }
);

export const getPublishedStudioCount = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select()
        .from(studioItems)
        .where(eq(studioItems.published, true));
      return rows.length;
    } catch {
      return 0;
    }
  },
  ["public-studio-count"],
  { tags: ["studio_items"] }
);

export const getPublishedArticleCount = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select()
        .from(articles)
        .where(eq(articles.status, "published"));
      return rows.length;
    } catch {
      return 0;
    }
  },
  ["public-article-count"],
  { tags: ["articles"] }
);

export const getLatestPublishedArticle = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select({ id: articles.id, title: articles.title, slug: articles.slug })
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.createdAt))
        .limit(1);
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },
  ["public-latest-article"],
  { tags: ["articles"] }
);

export const getPublishedProfile = unstable_cache(
  async () => getProfile(),
  ["public-profile"],
  { tags: ["profile"], revalidate: 3600 }
);

export const getPublishedSkillCategoriesWithSkills = unstable_cache(
  async () => getSkillCategoriesWithSkills(false),
  ["public-skills-grouped"],
  { tags: ["skill_categories", "skills"], revalidate: 3600 }
);

export const getPublishedExperience = unstable_cache(
  async () => getExperienceList(false),
  ["public-experience"],
  { tags: ["experience"], revalidate: 3600 }
);

export const getPublishedServices = unstable_cache(
  async () => getServicesList(false),
  ["public-services"],
  { tags: ["services"], revalidate: 3600 }
);

export const getPublishedTestimonials = unstable_cache(
  async () => getTestimonialsList(false),
  ["public-testimonials"],
  { tags: ["testimonials"], revalidate: 3600 }
);

export const getPublishedAvailability = unstable_cache(
  async () => getAvailability(),
  ["public-availability"],
  { tags: ["availability"], revalidate: 3600 }
);

export const getPublishedNowProject = unstable_cache(
  async () => getNowProject(),
  ["public-now-project"],
  { tags: ["now_project"], revalidate: 3600 }
);

export const getPublishedBuildLogs = unstable_cache(
  async () => getBuildLogEntries(false),
  ["public-build-logs"],
  { tags: ["build_log"], revalidate: 3600 }
);

export const getPublishedContactMethods = unstable_cache(
  async () => getContactMethodsList(false),
  ["public-contact-methods"],
  { tags: ["contact_methods"], revalidate: 3600 }
);

export const getPublishedSiteSettings = unstable_cache(
  async () => getSiteSettings(),
  ["public-site-settings"],
  { tags: ["site_settings"], revalidate: 3600 }
);
