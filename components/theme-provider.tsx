"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    "light"
  );

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && (stored === "light" || stored === "dark")) {
        setThemeState(stored);
        setResolvedTheme(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        setThemeState("system");
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const initial = isDark ? "dark" : "light";
        setResolvedTheme(initial);
        document.documentElement.setAttribute("data-theme", initial);
      }
    } catch {
      // Fallback if localStorage or matchMedia is inaccessible
    }
  }, []);

  React.useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      const nextTheme = e.matches ? "dark" : "light";
      setResolvedTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    if (next === "system") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = isDark ? "dark" : "light";
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      setResolvedTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
