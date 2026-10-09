import { HEX_CLIP_PATH } from "@/lib/hex";
import { Mail, Phone, Calendar, ExternalLink, Globe } from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/site/social-icons";
import { cn } from "@/lib/utils";

interface ContactMethod {
  id: number;
  type: string; // "email" | "whatsapp" | "phone" | "linkedin" | "github" | "x" | "behance" | "instagram" | "cal"
  label: string;
  value: string;
  icon: string;
  order: number;
}

interface ContactMethodsGridProps {
  methods: ContactMethod[];
}

function resolveHref(type: string, value: string): string {
  const clean = value.trim();
  if (type === "email" && !clean.startsWith("mailto:")) return `mailto:${clean}`;
  if (type === "phone" && !clean.startsWith("tel:")) return `tel:${clean}`;
  if (type === "whatsapp") {
    const num = clean.replace(/[^0-9]/g, "");
    return `https://wa.me/${num}`;
  }
  if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("mailto:") && !clean.startsWith("tel:")) {
    return `https://${clean}`;
  }
  return clean;
}

function renderIcon(type: string, className = "w-5 h-5") {
  switch (type.toLowerCase()) {
    case "email":
      return <Mail className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    case "github":
      return <GithubIcon className={className} />;
    case "linkedin":
      return <LinkedinIcon className={className} />;
    case "x":
    case "twitter":
      return <XIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "cal":
    case "booking":
      return <Calendar className={className} />;
    default:
      return <Globe className={className} />;
  }
}

export function ContactMethodsGrid({ methods }: ContactMethodsGridProps) {
  if (methods.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {methods.map((method) => {
        const href = resolveHref(method.type, method.value);
        const isExternal = href.startsWith("http");

        return (
          <a
            key={method.id}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group flex flex-col items-center justify-center p-6 bg-surface border border-border hover:border-primary transition-all duration-300 text-center space-y-3 focus:outline-none"
            aria-label={`${method.label}: ${method.value}`}
          >
            {/* Hex Icon Emblem */}
            <div
              className="w-12 h-14 bg-background border border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground text-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ clipPath: HEX_CLIP_PATH }}
            >
              {renderIcon(method.type, "w-5 h-5")}
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors block font-semibold">
                {method.label}
              </span>
              <span className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5 font-mono">
                {method.value}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
