import { Quote } from "lucide-react";
import { HEX_CLIP_PATH } from "@/lib/hex";

interface TestimonialItem {
  id: number;
  quote: string;
  name: string;
  role: string;
  photoUrl: string | null;
}

interface TestimonialsRailProps {
  testimonials: TestimonialItem[];
}

export function TestimonialsRail({ testimonials }: TestimonialsRailProps) {
  if (testimonials.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((item) => (
        <div
          key={item.id}
          className="flex flex-col justify-between bg-surface border border-border p-6 sm:p-7 relative group hover:border-primary/60 transition-colors"
        >
          <Quote className="w-8 h-8 text-primary/20 mb-4 flex-shrink-0" />

          <p className="text-sm sm:text-base text-foreground/90 italic leading-relaxed mb-6">
            "{item.quote}"
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-border/60">
            {item.photoUrl ? (
              <div
                className="w-10 h-11 bg-border p-0.5 flex-shrink-0"
                style={{ clipPath: HEX_CLIP_PATH }}
              >
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  style={{ clipPath: HEX_CLIP_PATH }}
                />
              </div>
            ) : (
              <div
                className="w-10 h-11 bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ clipPath: HEX_CLIP_PATH }}
              >
                {item.name.charAt(0)}
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
