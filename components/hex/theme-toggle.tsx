"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Toggle theme"
      }
      className={cn(
        "group relative flex h-11 w-10 items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      style={{
        clipPath: HEX_CLIP_PATH,
        perspective: "600px",
      }}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center transition-all duration-500 [transform-style:preserve-3d]",
          isDark ? "bg-surface text-foreground [transform:rotateY(180deg)]" : "bg-surface text-foreground"
        )}
      >
        <div className="flex items-center justify-center [backface-visibility:hidden]">
          <Moon className="h-4 w-4 text-foreground transition-colors group-hover:text-primary" />
        </div>
        <div className="absolute flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <Sun className="h-4 w-4 text-foreground transition-colors group-hover:text-primary" />
        </div>
      </div>
    </button>
  );
}
