import { requireAuth } from "@/lib/auth";
import { getAllTags, getAllSeries } from "@/lib/db/queries/articles";
import { getAllMediaAssets } from "@/lib/db/queries/media";
import { JournalEditor } from "../[id]/journal-editor";

export default async function NewArticlePage() {
  await requireAuth();

  const [tagRows, seriesRows, mediaRows] = await Promise.all([
    getAllTags(),
    getAllSeries(),
    getAllMediaAssets(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">New Article</h2>
          <p className="text-xs font-mono text-muted-foreground">Write, preview, then publish or schedule.</p>
        </div>
        <a
          href="/admin/journal"
          className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </a>
      </div>

      <JournalEditor
        mode="create"
        allTags={tagRows}
        allSeries={seriesRows.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description ?? null,
          order: s.order,
        }))}
        mediaAssets={mediaRows.map((a) => ({
          ...a,
          type: a.type as "image" | "video",
          dominantColor: a.dominantColor ?? undefined,
        }))}
      />
    </div>
  );
}
