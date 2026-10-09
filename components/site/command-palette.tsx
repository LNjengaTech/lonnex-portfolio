"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Briefcase,
  Image,
  BookOpen,
  User,
  Clock,
  Mail,
  Sun,
  Moon,
  Monitor,
  Hash,
} from "lucide-react";

// Static nav commands — rooms don't change at runtime
const NAV_COMMANDS = [
  { label: "Work", href: "/work", icon: Briefcase, group: "Navigate" },
  { label: "Studio", href: "/studio", icon: Image, group: "Navigate" },
  { label: "Journal", href: "/journal", icon: BookOpen, group: "Navigate" },
  { label: "About", href: "/about", icon: User, group: "Navigate" },
  { label: "Now", href: "/now", icon: Clock, group: "Navigate" },
  { label: "Contact", href: "/contact", icon: Mail, group: "Navigate" },
];

const THEME_COMMANDS = [
  { label: "Light theme", icon: Sun, theme: "light" },
  { label: "Dark theme", icon: Moon, theme: "dark" },
  { label: "System theme", icon: Monitor, theme: "system" },
];

interface DynamicItem {
  label: string;
  href: string;
  group: string;
}

interface CommandPaletteProps {
  /** Pre-fetched projects for jump-to commands */
  projects?: DynamicItem[];
  /** Pre-fetched articles for jump-to commands */
  articles?: DynamicItem[];
}

export function CommandPalette({ projects = [], articles = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const setTheme = useCallback((theme: string) => {
    close();
    document.documentElement.setAttribute("data-theme", theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme
    );
    try { localStorage.setItem("theme", theme); } catch { /* noop */ }
  }, [close]);

  const q = query.toLowerCase();

  const filteredNav = NAV_COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
  const filteredTheme = THEME_COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
  const filteredProjects = projects.filter((p) => p.label.toLowerCase().includes(q));
  const filteredArticles = articles.filter((a) => a.label.toLowerCase().includes(q));

  const isEmpty =
    !filteredNav.length && !filteredTheme.length &&
    !filteredProjects.length && !filteredArticles.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        className="relative z-10 w-full max-w-lg shadow-2xl border border-border"
        role="dialog"
        aria-label="Command palette"
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <Command>
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Jump to a room, project or article…"
          />
          <CommandList>
            {isEmpty && (
              <CommandEmpty>
                <span className="font-mono text-xs">// no results for &quot;{query}&quot;</span>
              </CommandEmpty>
            )}

            {filteredNav.length > 0 && (
              <CommandGroup heading="Navigate">
                {filteredNav.map((cmd) => (
                  <CommandItem key={cmd.href} onSelect={() => navigate(cmd.href)}>
                    <cmd.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {cmd.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredProjects.length > 0 && (
              <CommandGroup heading="Projects">
                {filteredProjects.map((p) => (
                  <CommandItem key={p.href} onSelect={() => navigate(p.href)}>
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    {p.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredArticles.length > 0 && (
              <CommandGroup heading="Articles">
                {filteredArticles.map((a) => (
                  <CommandItem key={a.href} onSelect={() => navigate(a.href)}>
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    {a.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredTheme.length > 0 && (
              <CommandGroup heading="Appearance">
                {filteredTheme.map((cmd) => (
                  <CommandItem key={cmd.theme} onSelect={() => setTheme(cmd.theme)}>
                    <cmd.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {cmd.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              ⌘K to close
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              ↵ to select
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
