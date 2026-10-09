"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/hex/theme-toggle";

interface AdminHeaderProps {
  title?: string;
  availabilityStatus?: "available" | "limited" | "booked";
}

export function AdminHeader({
  title = "Dashboard",
  availabilityStatus = "available",
}: AdminHeaderProps) {
  const statusColors = {
    available: "bg-success text-success",
    limited: "bg-warning text-warning",
    booked: "bg-danger text-danger",
  };

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-foreground tracking-tight">
          {title}
        </h1>
        <span className="text-muted-foreground font-mono text-xs">/</span>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Admin
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Availability quick status indicator */}
        <div className="hidden sm:flex items-center gap-2 border border-border px-2.5 py-1 text-xs font-mono uppercase bg-background">
          <span
            className={`inline-block h-2 w-2 ${statusColors[availabilityStatus].split(" ")[0]}`}
          />
          <span className="text-muted-foreground">{availabilityStatus}</span>
        </div>

        {/* Public site link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground hover:text-primary transition-colors border border-border px-2.5 py-1 bg-surface"
        >
          <span>View Site</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
