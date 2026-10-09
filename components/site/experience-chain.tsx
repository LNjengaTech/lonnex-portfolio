import { HEX_CLIP_PATH } from "@/lib/hex";
import { Briefcase, GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceItem {
  id: number;
  role: string;
  org: string;
  dates: string;
  description: string;
  type: string; // "work" | "education"
  order: number;
}

interface ExperienceChainProps {
  items: ExperienceItem[];
}

export function ExperienceChain({ items }: ExperienceChainProps) {
  if (items.length === 0) return null;

  return (
    <div className="relative pl-8 sm:pl-10 space-y-10 sm:space-y-12">
      {/* Continuous Vertical Chain Guideline */}
      <div
        className="absolute left-[13px] sm:left-[17px] top-4 bottom-4 w-px bg-border"
        aria-hidden="true"
      />

      {items.map((item, idx) => {
        const isWork = item.type === "work";

        return (
          <div key={item.id} className="relative group">
            {/* Connected Hex Node */}
            <div
              className={cn(
                "absolute -left-8 sm:-left-10 top-0.5 w-7 h-8 sm:w-9 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                isWork
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-primary text-primary"
              )}
              style={{ clipPath: HEX_CLIP_PATH }}
              aria-hidden="true"
            >
              {isWork ? (
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>

            {/* Experience Card */}
            <div className="bg-surface border border-border p-5 sm:p-6 group-hover:border-primary/60 transition-colors space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                    {isWork ? "Work Experience" : "Education & Training"}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-foreground">
                    {item.role}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground self-start sm:self-auto">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{item.dates}</span>
                </div>
              </div>

              <p className="text-sm font-medium text-foreground/90">
                {item.org}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
