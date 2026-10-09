"use client";

import * as React from "react";
import { X } from "lucide-react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(
  undefined
);

export function Sheet({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = setControlledOpen ?? setUncontrolledOpen;

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SheetContext);
  return (
    <button
      type="button"
      onClick={() => context?.onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right";
}) {
  const context = React.useContext(SheetContext);

  if (!context?.open) return null;

  const sideClasses = {
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border",
    top: "inset-x-0 top-0 h-1/3 border-b border-border",
    bottom: "inset-x-0 bottom-0 h-1/3 border-t border-border",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => context.onOpenChange(false)}
      />

      {/* Sheet Content */}
      <div
        className={cn(
          "fixed z-50 bg-surface p-6 shadow-xl transition-transform text-foreground",
          sideClasses[side],
          className
        )}
        role="dialog"
        {...props}
      >
        <button
          type="button"
          onClick={() => context.onOpenChange(false)}
          className="absolute right-4 top-4 flex h-8 w-7 items-center justify-center bg-surface border-border text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer transition-colors"
          style={{ clipPath: HEX_CLIP_PATH }}
          aria-label="Close sheet"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold text-foreground", className)}
      {...props}
    />
  );
}
