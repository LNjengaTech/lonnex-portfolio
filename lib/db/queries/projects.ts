import { and, asc, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { projects, projectMedia, projectStack, testimonials } from "@/lib/db/schema";

export interface ProjectCoverMedia {
  cloudinaryId?: string;
  url?: string;
  width?: number;
  height?: number;
  mediaType?: "image" | "video";
  caption?: string;
}

export interface ProjectPreviewVideo {
  cloudinaryId?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface ProjectMetricItem {
  label: string;
  value: string;
}

export interface PublicProjectItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  role: string;
  year: string;
  client: string | null;
  status: string;
  category: "web" | "mobile" | "systems" | "open_source" | string;
  tileSize: "S" | "M" | "L" | "XL";
  featured: boolean;
  order: number;
  coverMedia: ProjectCoverMedia | null;
  previewVideo: ProjectPreviewVideo | null;
  liveUrl: string | null;
  repoUrl: string | null;
  problem: string;
  approach: string;
  result: string;
  metrics: Record<string, unknown> | null;
  metricsItems: ProjectMetricItem[];
  confidential: boolean;
  seo: { title?: string; description?: string } | null;
  stack: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMediaItem {
  id: number;
  projectId: number;
  mediaType: string;
  cloudinaryId: string;
  url: string;
  width: number;
  height: number;
  caption: string | null;
  order: number;
  createdAt: Date;
}

export interface NextProjectPreview {
  id: number;
  slug: string;
  title: string;
  category: string;
  role: string;
  year: string;
  tileSize: string;
  coverMedia: ProjectCoverMedia | null;
}

export interface ProjectClientTestimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  photoUrl: string | null;
  projectId: number | null;
}

export interface PublicProjectDetail extends PublicProjectItem {
  media: ProjectMediaItem[];
  nextProject: NextProjectPreview | null;
  testimonial: ProjectClientTestimonial | null;
}

export async function getProjectsList(includeUnpublished = true) {
  try {
    const list = includeUnpublished
      ? await db
          .select()
          .from(projects)
          .orderBy(asc(projects.order), desc(projects.id))
      : await db
          .select()
          .from(projects)
          .where(eq(projects.published, true))
          .orderBy(asc(projects.order), desc(projects.id));

    // Attach stack tags
    const allStacks = await db
      .select()
      .from(projectStack)
      .orderBy(asc(projectStack.order));

    return list.map((p) => {
      const pMetrics = (p.metrics as Record<string, unknown>) || {};
      return {
        ...p,
        confidential: Boolean(pMetrics.confidential),
        metricsItems: Array.isArray(pMetrics.items)
          ? (pMetrics.items as ProjectMetricItem[])
          : [],
        stack: allStacks
          .filter((s) => s.projectId === p.id)
          .map((s) => s.name),
      };
    });
  } catch (error) {
    console.error("[getProjectsList Error]:", error);
    return [];
  }
}

export async function getProjectById(id: number) {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!rows.length) return null;
    const p = rows[0];

    const media = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, id))
      .orderBy(asc(projectMedia.order), asc(projectMedia.id));

    const stack = await db
      .select()
      .from(projectStack)
      .where(eq(projectStack.projectId, id))
      .orderBy(asc(projectStack.order));

    const pMetrics = (p.metrics as Record<string, unknown>) || {};

    return {
      ...p,
      confidential: Boolean(pMetrics.confidential),
      metricsItems: Array.isArray(pMetrics.items)
        ? (pMetrics.items as ProjectMetricItem[])
        : [],
      media,
      stack: stack.map((s) => s.name),
    };
  } catch (error) {
    console.error("[getProjectById Error]:", error);
    return null;
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!rows.length) return null;
    return await getProjectById(rows[0].id);
  } catch (error) {
    console.error("[getProjectBySlug Error]:", error);
    return null;
  }
}

export async function getProjectMedia(projectId: number) {
  try {
    return await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectId))
      .orderBy(asc(projectMedia.order), asc(projectMedia.id));
  } catch (error) {
    console.error("[getProjectMedia Error]:", error);
    return [];
  }
}

/**
 * Public cached query: returns all published projects with attached stack tags and metrics.
 * Uses Next.js unstable_cache with tag "projects".
 */
export const getPublishedProjectsWithDetails = unstable_cache(
  async (): Promise<PublicProjectItem[]> => {
    try {
      const list = await db
        .select()
        .from(projects)
        .where(eq(projects.published, true))
        .orderBy(asc(projects.order), desc(projects.id));

      const allStacks = await db
        .select()
        .from(projectStack)
        .orderBy(asc(projectStack.order));

      return list.map((p) => {
        const pMetrics = (p.metrics as Record<string, unknown>) || {};
        return {
          ...p,
          confidential: Boolean(pMetrics.confidential),
          metricsItems: Array.isArray(pMetrics.items)
            ? (pMetrics.items as ProjectMetricItem[])
            : [],
          stack: allStacks
            .filter((s) => s.projectId === p.id)
            .map((s) => s.name),
        } as unknown as PublicProjectItem;
      });
    } catch (error) {
      console.error("[getPublishedProjectsWithDetails Error]:", error);
      return [];
    }
  },
  ["public-projects-with-details"],
  { tags: ["projects"] }
);

/**
 * Public cached query: returns a single published project with gallery media,
 * next project preview, and client testimonial.
 */
export async function getPublishedProjectDetailBySlug(
  slug: string
): Promise<PublicProjectDetail | null> {
  const fetcher = unstable_cache(
    async (): Promise<PublicProjectDetail | null> => {
      try {
        const rows = await db
          .select()
          .from(projects)
          .where(eq(projects.slug, slug))
          .limit(1);

        if (!rows.length || !rows[0].published) return null;
        const p = rows[0];

        // Media items
        const media = await db
          .select()
          .from(projectMedia)
          .where(eq(projectMedia.projectId, p.id))
          .orderBy(asc(projectMedia.order), asc(projectMedia.id));

        // Stack tags
        const stack = await db
          .select()
          .from(projectStack)
          .where(eq(projectStack.projectId, p.id))
          .orderBy(asc(projectStack.order));

        const pMetrics = (p.metrics as Record<string, unknown>) || {};

        // All published projects to compute next project preview
        const allPublished = await db
          .select({
            id: projects.id,
            slug: projects.slug,
            title: projects.title,
            category: projects.category,
            role: projects.role,
            year: projects.year,
            tileSize: projects.tileSize,
            coverMedia: projects.coverMedia,
          })
          .from(projects)
          .where(eq(projects.published, true))
          .orderBy(asc(projects.order), desc(projects.id));

        const currentIndex = allPublished.findIndex((item) => item.id === p.id);
        let nextProject: NextProjectPreview | null = null;
        if (allPublished.length > 1 && currentIndex !== -1) {
          const next = allPublished[(currentIndex + 1) % allPublished.length];
          nextProject = {
            id: next.id,
            slug: next.slug,
            title: next.title,
            category: next.category,
            role: next.role,
            year: next.year,
            tileSize: next.tileSize,
            coverMedia: next.coverMedia as ProjectCoverMedia | null,
          };
        }

        // Testimonial lookup: matching projectId or first published testimonial
        let testimonial: ProjectClientTestimonial | null = null;
        const projectTestimonials = await db
          .select({
            id: testimonials.id,
            quote: testimonials.quote,
            name: testimonials.name,
            role: testimonials.role,
            photoUrl: testimonials.photoUrl,
            projectId: testimonials.projectId,
          })
          .from(testimonials)
          .where(
            and(
              eq(testimonials.published, true),
              eq(testimonials.projectId, p.id)
            )
          )
          .limit(1);

        if (projectTestimonials.length > 0) {
          testimonial = projectTestimonials[0];
        } else {
          const generalTestimonials = await db
            .select({
              id: testimonials.id,
              quote: testimonials.quote,
              name: testimonials.name,
              role: testimonials.role,
              photoUrl: testimonials.photoUrl,
              projectId: testimonials.projectId,
            })
            .from(testimonials)
            .where(eq(testimonials.published, true))
            .orderBy(asc(testimonials.order), asc(testimonials.id))
            .limit(1);

          testimonial = generalTestimonials[0] ?? null;
        }

        return {
          ...p,
          confidential: Boolean(pMetrics.confidential),
          metricsItems: Array.isArray(pMetrics.items)
            ? (pMetrics.items as ProjectMetricItem[])
            : [],
          media: media as ProjectMediaItem[],
          stack: stack.map((s) => s.name),
          nextProject,
          testimonial,
        } as unknown as PublicProjectDetail;
      } catch (error) {
        console.error("[getPublishedProjectDetailBySlug Error]:", error);
        return null;
      }
    },
    [`public-project-detail-${slug}`],
    { tags: ["projects", "project_media", "testimonials"] }
  );

  return fetcher();
}
