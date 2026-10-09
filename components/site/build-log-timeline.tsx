import { HEX_CLIP_PATH } from "@/lib/hex";
import { Terminal, Calendar } from "lucide-react";

interface BuildLogEntry {
  id: number;
  title: string;
  content: string;
  logDate: Date;
  order: number;
}

interface BuildLogTimelineProps {
  entries: BuildLogEntry[];
}

export function BuildLogTimeline({ entries }: BuildLogTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border bg-surface/50 text-sm text-muted-foreground">
        No public build logs recorded yet. Check back soon for sprint notes.
      </div>
    );
  }

  return (
    <div className="relative pl-8 sm:pl-10 space-y-8 sm:space-y-10">
      {/* Vertical guideline */}
      <div
        className="absolute left-[13px] sm:left-[17px] top-3 bottom-3 w-px bg-border"
        aria-hidden="true"
      />

      {entries.map((entry) => {
        const dateStr = new Date(entry.logDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div key={entry.id} className="relative group">
            {/* Hex Node */}
            <div
              className="absolute -left-8 sm:-left-10 top-1 w-7 h-8 sm:w-9 sm:h-10 bg-primary/20 border border-primary text-primary flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ clipPath: HEX_CLIP_PATH }}
              aria-hidden="true"
            >
              <Terminal className="w-3.5 h-3.5" />
            </div>

            {/* Entry card */}
            <div className="bg-surface border border-border p-5 sm:p-6 group-hover:border-primary/50 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-base font-bold text-foreground">
                  {entry.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <time dateTime={new Date(entry.logDate).toISOString()}>{dateStr}</time>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
