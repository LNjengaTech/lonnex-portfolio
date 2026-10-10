import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Radio, Sparkles } from "lucide-react";
import {
  getPublishedAvailability,
  getPublishedNowProject,
  getPublishedBuildLogs,
  getPublishedSiteSettings,
} from "@/lib/db/queries/public";
import { NairobiLiveClock } from "@/components/site/nairobi-live-clock";
import { HexProgressRing } from "@/components/site/hex-progress-ring";
import { BuildLogTimeline } from "@/components/site/build-log-timeline";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";
import { cn } from "@/lib/utils";

export const revalidate = 60; // frequent revalidation for live now page

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublishedSiteSettings();
  const siteTitle = settings?.siteTitle || "Lonnex Njenga";

  return {
    title: `Now — Availability, Current Sprint & Build Log | ${siteTitle}`,
    description:
      "Real-time snapshot of current engineering projects, sprint build logs, client availability, and Nairobi live clock.",
  };
}

export default async function NowPage() {
  const [availability, project, buildLogs, settings] = await Promise.all([
    getPublishedAvailability(),
    getPublishedNowProject(),
    getPublishedBuildLogs(),
    getPublishedSiteSettings(),
  ]);

  const isAvailable = availability.status === "available";
  const isLimited = availability.status === "limited";

  const stackList = Array.isArray(project.stack) ? (project.stack as string[]) : [];

  return (
    <main className="min-h-screen bg-background">
      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-16 sm:pt-20 pb-12 md:pt-28 md:pb-16 max-w-5xl mx-auto space-y-6">
        {/* Background geometric wireframe clusters with glowing dots */}
        <HexWireframeClusters
          variant="all"
          strokeWidth={0.65}
          className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-45"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-3">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              Real-Time Pulse · /now
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
              Now
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Inspired by Derek Sivers' /now page movement. A live window into active focus, current build sprints, client capacity, and physical time.
            </p>
          </div>

          {/* Nairobi Clock */}
          <div className="self-start sm:self-auto">
            <NairobiLiveClock />
          </div>
        </div>

        {/* ── 2. Availability Beacon ────────────────────────────────────────── */}
        <div className="bg-surface border border-border p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Pulsing Beacon Dot */}
              <span className="relative flex h-4 w-4">
                <span
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isAvailable ? "bg-emerald-500" : isLimited ? "bg-amber-500" : "bg-primary"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-4 w-4",
                    isAvailable ? "bg-emerald-500" : isLimited ? "bg-amber-500" : "bg-primary"
                  )}
                />
              </span>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Status
                </span>
                <h3 className="text-lg font-bold text-foreground capitalize">
                  {availability.status === "available"
                    ? "Available for New Projects"
                    : availability.status === "limited"
                    ? "Limited Availability (Selective Contracts)"
                    : "Currently Fully Booked"}
                </h3>
              </div>
            </div>

            {availability.nextAvailableDate && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-background px-3 py-1.5 border border-border self-start sm:self-auto">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Next Opening: {availability.nextAvailableDate}</span>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-medium">
            {availability.message}
          </p>

          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <span>Inquire about collaboration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Current Project Focus ──────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-12 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              Active Build Sprint
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Current Project
            </h2>
          </div>

          <div className="bg-background border border-border p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Info Column */}
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Status: {project.status.replace("_", " ")}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {project.title}
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {project.description}
                </p>

                {/* Stack Chips */}
                {stackList.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold mb-2">
                      Active Stack:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {stackList.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-mono bg-surface border border-border text-foreground/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hex Progress Ring */}
              <div className="md:col-span-4 flex justify-center">
                <HexProgressRing progress={project.progress} size={140} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Build Log ──────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
            Changelog & Sprint Notes
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Build Log
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Short, date-stamped dispatches from the terminal covering milestones, performance tunes, and architectural adjustments.
          </p>
        </div>

        <BuildLogTimeline entries={buildLogs} />
      </section>
    </main>
  );
}
