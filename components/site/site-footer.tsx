import Link from "next/link";
import { BrandHexTriple } from "@/components/hex/brand-hex-triple";
import { NairobiClock } from "@/components/site/nairobi-clock";
import { Globe } from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
  InstagramIcon,
} from "@/components/site/social-icons";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  x: XIcon,
  instagram: InstagramIcon,
};

const SOCIAL_TYPES = ["github", "linkedin", "twitter", "x", "instagram", "behance"];

interface SiteFooterProps {
  footerText?: string;
  tagline?: string;
  contactMethods?: Array<{
    id?: number;
    type: string;
    label: string;
    value: string;
    visible: boolean;
  }>;
}

export function SiteFooter({
  footerText = "© 2026 Lonnex Njenga. All rights reserved.",
  tagline = "More than code. It's a vision.",
  contactMethods = [],
}: SiteFooterProps) {
  const socialLinks = contactMethods.filter(
    (m) => m.visible && SOCIAL_TYPES.includes(m.type.toLowerCase())
  );

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Top row */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Triple hex cluster + tagline */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <BrandHexTriple size={52} />
            <p className="font-black text-sm sm:text-base text-foreground text-center sm:text-left max-w-xs">
              {tagline}
            </p>
          </div>

          {/* Nav columns */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3"
          >
            {[
              { label: "Work", href: "/work" },
              { label: "Studio", href: "/studio" },
              { label: "Journal", href: "/journal" },
              { label: "About", href: "/about" },
              { label: "Now", href: "/now" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Bottom row */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Copyright + clock */}
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4 text-center sm:text-left">
            <p className="font-mono text-[11px] text-muted-foreground">{footerText}</p>
            <NairobiClock className="font-mono text-[11px] text-muted-foreground" />
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4" aria-label="Social links">
              {socialLinks.map((m, idx) => {
                const Icon = SOCIAL_ICONS[m.type.toLowerCase()] || Globe;
                return (
                  <a
                    key={m.id ? `contact-${m.id}` : `${m.type}-${m.value}-${idx}`}
                    href={m.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={m.label}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
