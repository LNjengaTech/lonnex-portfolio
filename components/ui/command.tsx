"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Command({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden border border-border bg-surface text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const CommandInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    onValueChange?: (val: string) => void;
  }
>(function CommandInput(
  { className, value, onValueChange, placeholder = "Search commands...", ...props },
  ref
) {
  return (
    <div className="flex items-center border-b border-border px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
});
CommandInput.displayName = "CommandInput";

export function CommandList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("py-6 text-center text-sm text-muted-foreground font-mono", className)}
      {...props}
    >
      {children || "No results found."}
    </div>
  );
}

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { heading?: string }) {
  return (
    <div className={cn("overflow-hidden p-1 text-foreground", className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

export function CommandItem({
  className,
  children,
  onSelect,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-background hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
