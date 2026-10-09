import { requireAuth } from "@/lib/auth";
import { getProjectsList } from "@/lib/db/queries/projects";
import { getAllMediaAssets } from "@/lib/db/queries/media";
import { ProjectsClient } from "./projects-client";
import type { ProjectInput } from "@/lib/validators/projects";

interface ProjectItem extends ProjectInput {
  id: number;
}

export default async function AdminProjectsPage() {
  await requireAuth();

  const projects = await getProjectsList(true);
  const mediaAssets = await getAllMediaAssets();

  const formattedProjects: ProjectItem[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    role: p.role,
    year: p.year,
    client: p.client,
    status: p.status as ProjectInput["status"],
    category: p.category as ProjectInput["category"],
    tileSize: p.tileSize as ProjectInput["tileSize"],
    featured: p.featured,
    confidential: p.confidential,
    order: p.order,
    coverMedia: p.coverMedia as ProjectInput["coverMedia"],
    previewVideo: p.previewVideo as ProjectInput["previewVideo"],
    liveUrl: p.liveUrl,
    repoUrl: p.repoUrl,
    problem: p.problem,
    approach: p.approach,
    result: p.result,
    metrics: p.metricsItems || [],
    seo: p.seo as ProjectInput["seo"],
    published: p.published,
    stack: p.stack || [],
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Code Projects (The Honeycomb Wall)
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage full-stack applications, hex tile sizes (S/M/L/XL), case studies, and live previews.
        </p>
      </div>

      <ProjectsClient
        initialProjects={formattedProjects}
        mediaAssets={mediaAssets.map((a) => ({ ...a, type: a.type as "image" | "video" }))}
      />
    </div>
  );
}
