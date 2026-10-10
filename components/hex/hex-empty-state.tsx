import * as React from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface HexEmptyStateProps {
  title: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function HexEmptyState({
  title,
  message,
  action,
  icon: Icon = Inbox,
  className,
}: HexEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 sm:p-16 text-center space-y-4",
        className
      )}
      role="status"
    >
      {/* Brand Hex Hollow Badge */}
      <div
        className="flex items-center justify-center bg-surface border border-border"
        style={{ width: 68, height: 78, clipPath: HEX_CLIP_PATH }}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6 text-muted-foreground opacity-60" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-foreground font-semibold">
          {title}
        </h3>
        {message && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
