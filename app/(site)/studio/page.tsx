import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db/queries/settings";
import {
  getPublishedStudioCategories,
  getPublishedStudioCollections,
  getPublishedStudioItems,
} from "@/lib/db/queries/studio";
import { StudioWall } from "@/components/site/studio-wall";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.siteTitle ?? "Portfolio";
  return {
    title: `Studio — ${name}`,
    description: `Design work, motion, and visual storytelling by ${name}. Banners, brand identity, social media, and more.`,
  };
}

export default async function StudioPage() {
  const [items, categories, collections] = await Promise.all([
    getPublishedStudioItems(),
    getPublishedStudioCategories(),
    getPublishedStudioCollections(),
  ]);

  return (
    <main
      className="min-h-screen bg-surface"
      aria-label="Studio — design wall"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8 md:pt-28 md:pb-12 max-w-screen-2xl mx-auto">
        {/* Background geometric wireframe clusters with glowing dots */}
        <HexWireframeClusters
          variant="all"
          strokeWidth={0.65}
          className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-40"
        />

        <div className="relative z-10 flex flex-col gap-2">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Studio
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
            The Wall
          </h1>
          <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
            Banners, fliers, brand identity, social graphics, video ads, and
            motion work — all at their true aspect ratio.
          </p>
        </div>

        {items.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center text-center py-24 border border-dashed border-border rounded-lg">
            <p className="text-4xl mb-4 opacity-30">⬡</p>
            <p className="text-muted-foreground text-sm">
              Studio items will appear here once published from the admin.
            </p>
          </div>
        )}
      </section>

      {/* ── Wall ───────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <section className="px-4 sm:px-6 pb-20 sm:pb-24 max-w-screen-2xl mx-auto">
          <StudioWall
            items={items}
            categories={categories}
            collections={collections}
          />
        </section>
      )}
    </main>
  );
}
