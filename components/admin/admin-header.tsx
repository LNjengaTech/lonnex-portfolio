"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/hex/theme-toggle";
import { updateQuickAvailabilityAction } from "@/app/admin/(dashboard)/actions";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title?: string;
  availabilityStatus?: "available" | "limited" | "booked";
}

export function AdminHeader({
  title = "Dashboard",
  availabilityStatus = "available",
}: AdminHeaderProps) {
  const [currentStatus, setCurrentStatus] = React.useState<
    "available" | "limited" | "booked"
  >(availabilityStatus);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentStatus(availabilityStatus);
  }, [availabilityStatus]);

  // Click outside listener
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusConfig = {
    available: {
      label: "Available",
      dot: "bg-success",
      badge: "border-success/30 text-success",
    },
    limited: {
      label: "Limited",
      dot: "bg-warning",
      badge: "border-warning/30 text-warning",
    },
    booked: {
      label: "Booked",
      dot: "bg-danger",
      badge: "border-danger/30 text-danger",
    },
  };

  const handleSelectStatus = (status: "available" | "limited" | "booked") => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const prev = currentStatus;
      setCurrentStatus(status);
      setIsOpen(false);
      const res = await updateQuickAvailabilityAction(status);
      if (!res.success) {
        setCurrentStatus(prev);
      }
    });
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
        {/* Quick availability status toggle */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 border border-border px-3 py-1.5 text-xs font-mono uppercase bg-background hover:border-primary transition-colors cursor-pointer",
              isPending && "opacity-70 cursor-wait"
            )}
            title="Click to toggle availability from anywhere"
          >
            {isPending ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
            ) : (
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  statusConfig[currentStatus].dot
                )}
              />
            )}
            <span className="text-foreground font-bold">
              {statusConfig[currentStatus].label}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
          </button>

          {/* Quick Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-1 w-44 border border-border bg-surface shadow-xl z-50 p-1 space-y-0.5">
              <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-border mb-1">
                Set Availability
              </div>
              {(["available", "limited", "booked"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleSelectStatus(status)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono uppercase text-left transition-colors cursor-pointer",
                    currentStatus === status
                      ? "bg-background text-foreground font-bold"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        statusConfig[status].dot
                      )}
                    />
                    <span>{statusConfig[status].label}</span>
                  </div>
                  {currentStatus === status && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Public site link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground hover:text-primary transition-colors border border-border px-2.5 py-1.5 bg-surface"
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
