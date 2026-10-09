"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  onClose?: () => void;
  className?: string;
}

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
  className,
}: ToastProps) {
  const iconMap = {
    default: <Info className="h-4 w-4 text-primary" />,
    success: <CheckCircle2 className="h-4 w-4 text-success" />,
    warning: <AlertCircle className="h-4 w-4 text-warning" />,
    destructive: <AlertCircle className="h-4 w-4 text-danger" />,
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 border border-border bg-surface p-4 text-foreground shadow-lg transition-all",
        variant === "destructive" && "border-danger/50",
        variant === "success" && "border-success/50",
        className
      )}
      role="status"
    >
      <div className="flex-shrink-0 pt-0.5">{iconMap[variant]}</div>
      <div className="flex-1 space-y-1">
        <h5 className="text-sm font-bold leading-none">{title}</h5>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-5 w-4 items-center justify-center bg-surface text-muted-foreground hover:text-foreground cursor-pointer"
          style={{ clipPath: HEX_CLIP_PATH }}
          aria-label="Dismiss toast"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
