"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTextSize } from "./article-text-size-controls";
import { HEX_CLIP_PATH } from "@/lib/hex";

interface ArticleContentProps {
  html: string;
}

export function ArticleContent({ html }: ArticleContentProps) {
  const { textSize } = useTextSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // Client-side enhancement for code block copy buttons, filename headers, etc.
  useEffect(() => {
    if (!containerRef.current) return;
    const preElements = containerRef.current.querySelectorAll("pre");

    preElements.forEach((pre, idx) => {
      // Check if wrapper already created
      if (pre.parentElement?.classList.contains("enhanced-code-block")) return;

      const code = pre.querySelector("code");
      const text = code?.textContent || pre.textContent || "";
      const langClass = Array.from(code?.classList || []).find((c) => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "code";

      // Wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "enhanced-code-block my-6 overflow-hidden border border-border bg-surface text-sm";

      // Header bar
      const header = document.createElement("div");
      header.className = "flex items-center justify-between px-4 py-2 border-b border-border bg-background/50 font-mono text-xs text-muted-foreground";

      const langSpan = document.createElement("span");
      langSpan.className = "flex items-center gap-2 uppercase tracking-wider text-[11px] font-semibold text-foreground";
      langSpan.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>${lang}`;

      const copyBtn = document.createElement("button");
      copyBtn.className = "flex items-center gap-1.5 px-2 py-1 hover:text-foreground transition-colors cursor-pointer";
      copyBtn.setAttribute("aria-label", "Copy code");
      copyBtn.innerHTML = `<span>Copy</span>`;

      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = `<span class="text-primary font-bold">Copied!</span>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<span>Copy</span>`;
          }, 2000);
        });
      });

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      pre.className = "p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-surface";
    });
  }, [html]);

  // Dynamic text size classes
  const sizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed sm:text-[1.0625rem]",
    lg: "text-lg leading-relaxed sm:text-[1.2rem]",
  }[textSize];

  return (
    <div
      ref={containerRef}
      className={cn(
        "article-prose text-foreground max-w-[68ch] mx-auto",
        sizeClasses,
        // Drop cap on first paragraph
        "[&>p:first-of-type::first-letter]:float-left",
        "[&>p:first-of-type::first-letter]:text-5xl",
        "[&>p:first-of-type::first-letter]:sm:text-6xl",
        "[&>p:first-of-type::first-letter]:font-mono",
        "[&>p:first-of-type::first-letter]:font-bold",
        "[&>p:first-of-type::first-letter]:text-primary",
        "[&>p:first-of-type::first-letter]:mr-3.5",
        "[&>p:first-of-type::first-letter]:mt-1",
        "[&>p:first-of-type::first-letter]:leading-none",
        // Typography elements
        "[&>p]:mb-6 [&>p]:text-muted-foreground [&>p]:leading-[1.75]",
        "[&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:tracking-tight [&>h2]:scroll-mt-24",
        "[&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:tracking-tight [&>h3]:scroll-mt-24",
        "[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2 [&>ul]:text-muted-foreground",
        "[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-2 [&>ol]:text-muted-foreground",
        "[&>li]:leading-relaxed",
        "[&>hr]:my-10 [&>hr]:border-border",
        // Pull quotes with chamfered cut corners
        "[&>blockquote]:my-8 [&>blockquote]:p-6 [&>blockquote]:bg-surface [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:text-foreground [&>blockquote]:italic [&>blockquote]:text-lg [&>blockquote]:leading-relaxed",
        // Callouts (styled by data-type or blockquote classes if present)
        "[&>blockquote.callout-tip]:border-emerald-500 [&>blockquote.callout-tip]:bg-emerald-500/5",
        "[&>blockquote.callout-warning]:border-amber-500 [&>blockquote.callout-warning]:bg-amber-500/5",
        // Tables
        "[&>table]:w-full [&>table]:my-6 [&>table]:border-collapse [&>table]:border [&>table]:border-border",
        "[&>table_th]:border [&>table_th]:border-border [&>table_th]:p-3 [&>table_th]:bg-surface [&>table_th]:text-left [&>table_th]:font-semibold",
        "[&>table_td]:border [&>table_td]:border-border [&>table_td]:p-3 [&>table_td]:text-muted-foreground",
        // Links
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary/80 [&_a]:transition-colors",
        // Inline code
        "[&:not(pre)_code]:bg-surface [&:not(pre)_code]:px-1.5 [&:not(pre)_code]:py-0.5 [&:not(pre)_code]:text-xs [&:not(pre)_code]:font-mono [&:not(pre)_code]:border [&:not(pre)_code]:border-border [&:not(pre)_code]:text-foreground"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
