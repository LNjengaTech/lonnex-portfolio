import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  CheckCircle2,
  Clock,
  Layers,
  Building,
  Calendar,
  Quote,
} from "lucide-react";
import { GithubIcon } from "@/components/site/social-icons";
import { getPublishedProjectDetailBySlug } from "@/lib/db/queries/projects";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { ChamferFrame } from "@/components/hex/chamfer-frame";
import { HexChip } from "@/components/hex/hex-chip";
import { CloudVideo } from "@/components/site/cloud-video";
import { ProjectGalleryLightbox } from "@/components/site/project-gallery-lightbox";
import { ProjectNextHex } from "@/components/site/project-next-hex";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";
import { HEX_CLIP_PATH, calcHexWidth } from "@/lib/hex";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // Tag-based cache with 1h ISR fallback

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getPublishedProjectDetailBySlug(slug),
    getSiteSettings(),
  ]);

  if (!project) {
    return {
      title: "Project Not Found | Lonnex Njenga",
    };
  }

  const siteTitle =
    typeof settings.siteTitle === "string" ? settings.siteTitle : "Lonnex Njenga";

  return {
    title: `${project.title} — Case Study | ${siteTitle}`,
    description: project.summary,
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.summary,
      images: project.coverMedia?.url ? [project.coverMedia.url] : [],
    },
  };
}

export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getPublishedProjectDetailBySlug(slug);

  if (!project) {
    notFound();
  }

  const heroHexHeight = 320;
  const heroHexWidth = calcHexWidth(heroHexHeight);
  const coverUrl = resolveMediaUrl(
    project.coverMedia?.url || project.coverMedia?.cloudinaryId,
    { width: 1200, height: 800 }
  );

  const previewVideoUrl = resolveMediaUrl(
    project.previewVideo?.url || project.previewVideo?.cloudinaryId,
    { type: "video" }
  );

  const categoryLabel = project.category.replace("_", " ");
  const isCompleted = project.status === "completed";

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* ── Breadcrumb & Navigation Bar ── */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/work"
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary group-hover:-translate-x-1 transition-transform" />
            <span>Back To Hive</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="text-primary font-bold">{categoryLabel}</span>
            <span>·</span>
            <span>{project.year}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* ── Hero Section ── */}
        <section aria-label="Project hero" className="relative overflow-hidden pb-12 border-b border-border">
          {/* Background geometric wireframe clusters with glowing dots */}
          <HexWireframeClusters
            variant="all"
            strokeWidth={0.65}
            className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-40"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Left: Category, Role, Title, Summary, Actions */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary bg-surface border border-border px-2.5 py-1">
                  {categoryLabel}
                </span>

                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  // {project.role}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
                {project.title}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl">
                {project.summary}
              </p>

              {/* Action Links: Live Demo & Repo */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold transition-transform hover:-translate-y-0.5"
                  >
                    <span>View Live Site</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface text-foreground border border-border hover:border-primary font-mono text-xs uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            </div>

            {/* Hero Right: Pointy-Top Hero Hex Cover Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="relative select-none"
                style={{ width: `${heroHexWidth}px`, height: `${heroHexHeight}px` }}
              >
                {/* Hard Offset Wireframe Depth Layer */}
                <div
                  className="absolute inset-0 bg-primary/30 pointer-events-none -z-10 -translate-x-3 translate-y-3"
                  style={{ clipPath: HEX_CLIP_PATH }}
                  aria-hidden="true"
                />

                {/* SVG Hex Border */}
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full stroke-primary stroke-2 fill-none z-30"
                  viewBox="0 0 100 115.47"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <polygon
                    points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Clipped Hero Image */}
                <div
                  className="absolute inset-0 overflow-hidden bg-surface"
                  style={{
                    clipPath: HEX_CLIP_PATH,
                    viewTransitionName: `project-hero-${project.slug}`,
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={project.title}
                      className={cn(
                        "h-full w-full object-cover",
                        project.confidential && "filter blur-sm"
                      )}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase text-muted-foreground">
                      {project.title}
                    </div>
                  )}

                  {/* Dimmer Overlay */}
                  <div className="absolute inset-0 bg-background/30" />

                  {/* Confidential Overlay */}
                  {project.confidential && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center z-10">
                      <Lock className="h-6 w-6 text-warning mb-1" />
                      <span className="font-mono text-xs uppercase tracking-widest text-warning font-bold">
                        Confidential Client
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Key Metrics Strip ── */}
        {project.metricsItems && project.metricsItems.length > 0 && (
          <section aria-label="Key project metrics" className="py-8 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">
                Key Metrics & Benchmarks
              </span>
              {project.confidential && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-warning bg-surface border border-warning/40 px-2 py-0.5">
                  <Lock className="h-3 w-3" />
                  <span>Verified Under NDA</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {project.metricsItems.map((metric, idx) => (
                <ChamferFrame
                  key={metric.label || idx}
                  corners="tr-bl"
                  cutSize={12}
                  className="bg-surface border border-border p-4 flex flex-col justify-between"
                >
                  <span className="font-black text-2xl sm:text-3xl text-primary tracking-tight">
                    {metric.value}
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mt-2">
                    {metric.label}
                  </span>
                </ChamferFrame>
              ))}
            </div>
          </section>
        )}

        {/* ── Main Content Grid: 8 Cols Content + 4 Cols Facts Column ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-10">
          {/* Main Column (8 cols): Problem / Approach / Result + Media + Testimonial */}
          <main className="lg:col-span-8 flex flex-col gap-12">
            {/* ── Problem / Approach / Result: Three Big Numbered Blocks ── */}
            <section aria-label="Problem, Approach, and Result" className="flex flex-col gap-8">
              {/* Block 01: Problem */}
              <div className="relative bg-surface border border-border p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary">
                      01
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      The Challenge
                    </span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl uppercase tracking-tight text-foreground">
                    Problem
                  </h2>
                </div>
                <p className="font-sans text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">
                  {project.problem}
                </p>
              </div>

              {/* Block 02: Approach */}
              <div className="relative bg-surface border border-border p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary">
                      02
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      Architecture & Execution
                    </span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl uppercase tracking-tight text-foreground">
                    Approach
                  </h2>
                </div>
                <p className="font-sans text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">
                  {project.approach}
                </p>
              </div>

              {/* Block 03: Result */}
              <div className="relative bg-surface border border-border p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary">
                      03
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      Outcome & Delivery
                    </span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl uppercase tracking-tight text-foreground">
                    Result
                  </h2>
                </div>
                <p className="font-sans text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">
                  {project.result}
                </p>
              </div>
            </section>

            {/* ── Embedded Video Walkthrough (if video preview exists) ── */}
            {previewVideoUrl && (
              <section aria-label="Embedded video walkthrough" className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">
                    Video Walkthrough
                  </span>
                </div>

                <ChamferFrame corners="tl-br" cutSize={20} className="w-full bg-surface border border-border p-2">
                  <CloudVideo
                    publicId={previewVideoUrl}
                    width={1280}
                    height={720}
                    label={`${project.title} walkthrough video`}
                    controls
                    className="w-full aspect-16/9"
                  />
                </ChamferFrame>
              </section>
            )}

            {/* ── Gallery: Mixed Sizes & Modal Lightbox ── */}
            {project.media && project.media.length > 0 && (
              <section aria-label="Project artwork and gallery" className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">
                    Gallery & Visual Assets
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    · {project.media.length} items
                  </span>
                </div>

                <ProjectGalleryLightbox
                  media={project.media}
                  projectTitle={project.title}
                />
              </section>
            )}

            {/* ── Client Testimonial (if available) ── */}
            {project.testimonial && (
              <section aria-label="Client testimonial" className="relative">
                <ChamferFrame
                  corners="tr-bl"
                  cutSize={18}
                  className="w-full bg-surface border border-border p-6 sm:p-8"
                >
                  <Quote className="h-8 w-8 text-primary opacity-60 mb-3" />
                  <blockquote className="text-base sm:text-lg italic text-foreground leading-relaxed">
                    "{project.testimonial.quote}"
                  </blockquote>

                  <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                    {project.testimonial.photoUrl && (
                      <div
                        className="h-10 w-10 overflow-hidden bg-background border border-border flex-shrink-0"
                        style={{ clipPath: HEX_CLIP_PATH }}
                      >
                        <img
                          src={project.testimonial.photoUrl}
                          alt={project.testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-black text-sm uppercase tracking-tight text-foreground">
                        {project.testimonial.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {project.testimonial.role}
                      </span>
                    </div>
                  </div>
                </ChamferFrame>
              </section>
            )}
          </main>

          {/* ── Facts Column (4 cols, sticky on desktop) ── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 bg-surface border border-border p-6 flex flex-col gap-6">
              <div className="border-b border-border pb-3">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">
                  Project Specification
                </span>
              </div>

              <dl className="flex flex-col divide-y divide-border/60 text-xs font-mono uppercase">
                {/* Client */}
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-primary" />
                    <span>Client</span>
                  </dt>
                  <dd className="font-bold text-foreground">
                    {project.client || "Self-Initiated"}
                  </dd>
                </div>

                {/* Role */}
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>Role</span>
                  </dt>
                  <dd className="font-bold text-foreground text-right max-w-[60%]">
                    {project.role}
                  </dd>
                </div>

                {/* Year */}
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Year</span>
                  </dt>
                  <dd className="font-bold text-foreground">{project.year}</dd>
                </div>

                {/* Status */}
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-warning" />
                    )}
                    <span>Status</span>
                  </dt>
                  <dd className="font-bold text-foreground">
                    {project.status.replace("_", " ")}
                  </dd>
                </div>

                {/* Tile Size in Hive */}
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="text-muted-foreground">Mosaic Scale</dt>
                  <dd className="font-bold text-primary">
                    Tile {project.tileSize}
                  </dd>
                </div>
              </dl>

              {/* Tech Stack Chips */}
              {project.stack && project.stack.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Technology Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((item) => (
                      <HexChip key={item} size="sm">
                        {item}
                      </HexChip>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold"
                  >
                    <span>Launch Live App</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 bg-surface text-foreground border border-border hover:border-primary font-mono text-xs uppercase tracking-wider transition-colors"
                  >
                    <GithubIcon className="h-3 w-3" />
                    <span>View Repository</span>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Next Project Hex Section ── */}
        {project.nextProject && (
          <div className="mt-16 border-t border-border">
            <ProjectNextHex nextProject={project.nextProject} />
          </div>
        )}
      </div>
    </div>
  );
}
