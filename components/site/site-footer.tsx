import Link from "next/link";
import { BrandHexTriple } from "@/components/hex/brand-hex-triple";
import { NairobiClock } from "@/components/site/nairobi-clock";
import { Globe } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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
