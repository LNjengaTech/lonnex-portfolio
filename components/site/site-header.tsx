"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { BrandLogoLockup } from "@/components/hex/brand-logo-lockup";
import { ThemeToggle } from "@/components/hex/theme-toggle";
import { RadialMenu } from "@/components/site/radial-menu";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  availabilityStatus?: "available" | "limited" | "booked";
  navLabels?: {
    work?: string;
    studio?: string;
    journal?: string;
    about?: string;
    now?: string;
    contact?: string;
  };
}

const STATUS_COLOR = {
  available: "bg-success",
  limited: "bg-warning",
  booked: "bg-danger",
} as const;

const NAV_LINKS = [
  { key: "work", href: "/work", default: "Work" },
  { key: "studio", href: "/studio", default: "Studio" },
  { key: "journal", href: "/journal", default: "Journal" },
  { key: "about", href: "/about", default: "About" },
  { key: "now", href: "/now", default: "Now" },
  { key: "contact", href: "/contact", default: "Contact" },
] as const;

export function SiteHeader({
  availabilityStatus = "available",
  navLabels = {},
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" aria-label="Home" className="flex-shrink-0">
            <BrandLogoLockup className="h-7" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map(({ key, href, default: def }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              >
                {navLabels[key as keyof typeof navLabels] ?? def}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Availability dot */}
            <Link
              href="/now"
              aria-label={`Availability: ${availabilityStatus}`}
              className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className={cn("inline-block h-2 w-2 rounded-full", STATUS_COLOR[availabilityStatus])}
              />
              <span className="hidden lg:inline">{availabilityStatus}</span>
            </Link>

            {/* Command palette search trigger (accessible on mobile & PWA) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              aria-label="Open command palette (Ctrl+K)"
              className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Search className="h-4 w-4" />
            </button>

            <ThemeToggle />

            {/* Hex hamburger — always visible */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className="flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              style={{ width: 36, height: 42 }}
            >
              <div
                className="w-full h-full bg-primary flex items-center justify-center"
                style={{ clipPath: HEX_CLIP_PATH }}
              >
                <Menu className="h-4 w-4 text-primary-foreground" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <RadialMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
