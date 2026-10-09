"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextSize = "sm" | "base" | "lg";

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType>({
  textSize: "base",
  setTextSize: () => {},
});

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>("base");

  useEffect(() => {
    const saved = localStorage.getItem("journal-text-size") as TextSize | null;
    if (saved && (saved === "sm" || saved === "base" || saved === "lg")) {
      setTextSizeState(saved);
    }
  }, []);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    try {
      localStorage.setItem("journal-text-size", size);
    } catch {
      // ignore
    }
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  return useContext(TextSizeContext);
}

export function TextSizeControls({ className }: { className?: string }) {
  const { textSize, setTextSize } = useTextSize();

  return (
    <div
      className={cn(
        "inline-flex items-center bg-surface border border-border p-0.5 text-xs font-mono",
        className
      )}
      role="group"
      aria-label="Adjust reading text size"
    >
      <button
        type="button"
        onClick={() => setTextSize("sm")}
        className={cn(
          "px-2 py-1 transition-colors",
          textSize === "sm"
            ? "bg-primary text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Small font size"
        aria-pressed={textSize === "sm"}
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => setTextSize("base")}
        className={cn(
          "px-2 py-1 transition-colors",
          textSize === "base"
            ? "bg-primary text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Normal font size"
        aria-pressed={textSize === "base"}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => setTextSize("lg")}
        className={cn(
          "px-2 py-1 transition-colors",
          textSize === "lg"
            ? "bg-primary text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Large font size"
        aria-pressed={textSize === "lg"}
      >
        A+
      </button>
    </div>
  );
}
