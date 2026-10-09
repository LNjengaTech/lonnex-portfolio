import Link from "next/link";
import { Check, ArrowRight, Clock, Tag } from "lucide-react";
import { ChamferFrame } from "@/components/hex/chamfer-frame";

interface ServiceItem {
  id: number;
  title: string;
  description: string;
  deliverables: unknown; // string[]
  priceFrom: string;
  timeline: string;
  icon: string;
}

interface ServicesGridProps {
  services: ServiceItem[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  if (services.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => {
        const deliverablesList = Array.isArray(service.deliverables)
          ? (service.deliverables as string[])
          : [];

        return (
          <div
            key={service.id}
            className="flex flex-col justify-between bg-surface border border-border p-6 hover:border-primary/70 transition-all duration-300 group"
          >
            <div className="space-y-4">
              {/* Header */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                  Service Offering
                </span>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                  {service.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              {/* Deliverables Checklist */}
              {deliverablesList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <p className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
                    What's included:
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {deliverablesList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer / Meta & CTA */}
            <div className="pt-6 mt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {service.priceFrom}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {service.timeline}
                </span>
              </div>

              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-background border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <span>Start this</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
