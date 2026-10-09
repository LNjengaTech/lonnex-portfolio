import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getPublishedContactMethods,
  getPublishedAvailability,
  getPublishedSiteSettings,
} from "@/lib/db/queries/public";
import { ContactMethodsGrid } from "@/components/site/contact-methods-grid";
import { ProjectBriefForm } from "@/components/site/project-brief-form";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublishedSiteSettings();
  const siteTitle = settings?.siteTitle || "Lonnex Njenga";

  return {
    title: `Contact — Channels & Project Brief | ${siteTitle}`,
    description:
      "Initiate collaboration or transmit a project brief. Reach Lonnex Njenga via email, WhatsApp, phone, or scheduled calendar session.",
  };
}

export default async function ContactPage() {
  const [methods, availability, settings] = await Promise.all([
    getPublishedContactMethods(),
    getPublishedAvailability(),
    getPublishedSiteSettings(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-20 pb-12 md:pt-28 md:pb-16 max-w-5xl mx-auto space-y-6">
        <div className="space-y-3 border-b border-border pb-8">
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
            Transmission Channels · /contact
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
            Whether initiating a full-stack web project, commissioning brand collateral, or booking technical advisory, all inquiries land directly in the Hive inbox.
          </p>
        </div>

        {/* ── 2. Direct Channels (Hex Buttons) ──────────────────────────────── */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
            Direct Transmission Nodes
          </h2>
          <ContactMethodsGrid methods={methods} />
        </div>
      </section>

      {/* ── 3. Project Brief Form ─────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              Project Specification
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Submit a Project Brief
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fill in your parameters below to lock in requirements, budget expectations, and target delivery windows.
            </p>
          </div>

          <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-muted-foreground">Loading brief form...</div>}>
            <ProjectBriefForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
