import type { Metadata } from "next";
import Link from "next/link";
import { Download, ArrowRight, Quote, Sparkles } from "lucide-react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import {
  getPublishedProfile,
  getPublishedSkillCategoriesWithSkills,
  getPublishedExperience,
  getPublishedServices,
  getPublishedTestimonials,
  getPublishedSiteSettings,
} from "@/lib/db/queries/public";
import { SkillsHive } from "@/components/site/skills-hive";
import { ExperienceChain } from "@/components/site/experience-chain";
import { ServicesGrid } from "@/components/site/services-grid";
import { TestimonialsRail } from "@/components/site/testimonials-rail";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublishedSiteSettings();
  const siteTitle = settings?.siteTitle || "Lonnex Njenga";

  return {
    title: `About — Profile, Skills Hive & Journey | ${siteTitle}`,
    description:
      "Full-stack engineer, spatial UX designer, and technical craftsman. Explore skills, professional experience, services, and client testimonials.",
  };
}

export default async function AboutPage() {
  const [profile, skillCategories, experience, services, testimonials, settings] =
    await Promise.all([
      getPublishedProfile(),
      getPublishedSkillCategoriesWithSkills(),
      getPublishedExperience(),
      getPublishedServices(),
      getPublishedTestimonials(),
      getPublishedSiteSettings(),
    ]);

  return (
    <main className="min-h-screen bg-background">
      {/* ── 1. Hero & Story ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-20 pb-16 md:pt-28 md:pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Photo in layered offset hexes */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-56 h-64 sm:w-64 sm:h-72">
              {/* Outer decorative offset hex 1 */}
              <div
                className="absolute inset-0 bg-primary/10 border border-primary/30 translate-x-3 translate-y-3 -z-10"
                style={{ clipPath: HEX_CLIP_PATH }}
                aria-hidden="true"
              />
              {/* Outer decorative offset hex 2 */}
              <div
                className="absolute inset-0 bg-surface border border-border -translate-x-3 -translate-y-3 -z-10"
                style={{ clipPath: HEX_CLIP_PATH }}
                aria-hidden="true"
              />

              {/* Main Photo Frame */}
              <div
                className="w-full h-full bg-border p-0.5 shadow-xl"
                style={{ clipPath: HEX_CLIP_PATH }}
              >
                <div
                  className="w-full h-full bg-surface overflow-hidden relative"
                  style={{ clipPath: HEX_CLIP_PATH }}
                >
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Story & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
                Profile & Philosophy
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {profile.name}
              </h1>
              <p className="text-base sm:text-lg text-primary/90 font-medium font-mono">
                {profile.location} · {profile.timezone}
              </p>
            </div>

            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-medium">
              {profile.shortBio}
            </p>

            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line space-y-3">
              {profile.longBio}
            </div>

            {/* Pull Quote with cut-corner style */}
            <div className="p-5 bg-surface border-l-4 border-primary text-foreground italic text-sm sm:text-base leading-relaxed">
              "Building software and visual collateral is architectural work: structural integrity first, followed by meticulous spatial balance."
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {settings.cvUrl && (
                <a
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CV / Resume</span>
                </a>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-surface border border-border text-foreground hover:border-primary transition-colors"
              >
                <span>Get in touch</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Skills as a Hive ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              The Architecture
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Skills as a Hive
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Every capability is calibrated as a hexagonal cell. Size and border indicate proficiency tiers across engineering and design.
            </p>
          </div>

          <SkillsHive categories={skillCategories} />
        </div>
      </section>

      {/* ── 3. Experience & Education ──────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto space-y-10">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
            Trajectory
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Experience & Education
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            A chronological axial chain spanning engineering leadership, production engineering, and academic foundations.
          </p>
        </div>

        <ExperienceChain items={experience} />
      </section>

      {/* ── 4. Services ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              Engagement Models
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Services & Collaborations
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              From end-to-end full-stack applications to commercial graphic collateral, with defined scopes, transparent starting rates, and fixed timelines.
            </p>
          </div>

          <ServicesGrid services={services} />
        </div>
      </section>

      {/* ── 5. Testimonials ────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto space-y-10">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              Endorsements
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Client Testimonials
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Feedback from founders, teams, and stakeholders who have collaborated with the studio.
            </p>
          </div>

          <TestimonialsRail testimonials={testimonials} />
        </section>
      )}
    </main>
  );
}
