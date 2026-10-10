"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { HEX_CLIP_PATH } from "@/lib/hex";

interface NavItem {
  label: string;
  href: string;
  number: string;
}

const NAV_ITEMS: NavItem[] = [
  { number: "01", label: "Work", href: "/work" },
  { number: "02", label: "Studio", href: "/studio" },
  { number: "03", label: "Journal", href: "/journal" },
  { number: "04", label: "About", href: "/about" },
  { number: "05", label: "Now", href: "/now" },
  { number: "06", label: "Contact", href: "/contact" },
];

// Angles for 6 items at 60° apart, starting from top (pointy-top hex directions)
const ANGLES = [-90, -30, 30, 90, 150, 210]; // degrees

interface RadialMenuProps {
  open: boolean;
  onClose: () => void;
}

export function RadialMenu({ open, onClose }: RadialMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  const triggerCommandPalette = () => {
    onClose();
    // Dispatch after next paint so menu unmounts cleanly first
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }, 50);
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      role="dialog"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Radial cells container */}
      <div className="relative z-10 w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] max-w-full max-h-full">
        {/* Close — center cell */}
        <button
          onClick={onClose}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition-transform hover:scale-105 active:scale-95"
          aria-label="Close menu"
        >
          <div
            className="w-14 h-16 sm:w-16 sm:h-20 bg-primary flex items-center justify-center shadow-lg"
            style={{ clipPath: HEX_CLIP_PATH }}
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </div>
        </button>

        {/* 6 room cells */}
        {NAV_ITEMS.map((item, i) => {
          const rad = (ANGLES[i] * Math.PI) / 180;
          // Responsive: radius 105px on mobile, 136px on tablet/desktop
          return (
            <div
              key={item.href}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                transform: `translate(calc(-50% + calc(var(--rad-r) * ${Math.cos(rad).toFixed(4)})), calc(-50% + calc(var(--rad-r) * ${Math.sin(rad).toFixed(4)})))`,
              }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "pointer-events-auto flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                  "group transition-transform hover:scale-110 active:scale-95",
                  "[--rad-r:105px] sm:[--rad-r:136px]"
                )}
                style={{
                  transform: `translate(calc(${Math.cos(rad).toFixed(4)} * var(--rad-r)), calc(${Math.sin(rad).toFixed(4)} * var(--rad-r)))`,
                }}
              >
                <div
                  className="w-[72px] h-[82px] sm:w-[86px] sm:h-[98px] bg-surface border border-border flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 group-hover:bg-primary group-focus-visible:bg-primary"
                  style={{ clipPath: HEX_CLIP_PATH }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary-foreground group-focus-visible:text-primary-foreground transition-colors">
                    {item.number}
                  </span>
                  <span className="font-black text-xs uppercase tracking-tight text-foreground group-hover:text-primary-foreground group-focus-visible:text-primary-foreground transition-colors">
                    {item.label}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom controls: Command bar button + Mobile room list */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 px-4 z-10">
        {/* Command palette / Quick search button */}
        <button
          onClick={triggerCommandPalette}
          className="flex items-center gap-2 border border-border/70 bg-surface/90 backdrop-blur-sm px-3.5 py-1.5 rounded-none text-muted-foreground hover:text-foreground hover:border-primary transition-all text-xs font-mono shadow-sm"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5 text-primary" />
          <span className="uppercase tracking-wider text-[11px]">Command Palette</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-background border border-border font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Mobile: full-list fallback below the radial */}
        <nav
          className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 sm:hidden"
          aria-label="Navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground active:text-primary transition-colors py-0.5 px-1.5"
            >
              {item.number}. {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
