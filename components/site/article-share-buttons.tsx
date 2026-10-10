"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Check, Share2 } from "lucide-react";
import { XIcon, LinkedinIcon, WhatsAppIcon } from "@/components/site/social-icons";
import { cn } from "@/lib/utils";

interface ArticleShareButtonsProps {
  title: string;
  slug: string;
  compact?: boolean;
}

export function ArticleShareButtons({ title, slug, compact = false }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    () => `${process.env.NEXT_PUBLIC_SITE_URL || "https://lonnex.dev"}/journal/${slug}`
  );

  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/journal/${slug}`);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, [slug]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        // user canceled or dismissed
      }
    }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(shareUrl)}`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title} ${shareUrl}`
  )}`;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-1.5 border border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
            title="Share article"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={copyToClipboard}
          className={cn(
            "p-1.5 border transition-colors",
            copied
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
          )}
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <LinkIcon className="w-3.5 h-3.5" />
          )}
        </button>
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 border border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          title="Share on X"
        >
          <XIcon className="w-3.5 h-3.5" />
        </a>
        <a
          href={linkedinShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 border border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          title="Share on LinkedIn"
        >
          <LinkedinIcon className="w-3.5 h-3.5" />
        </a>
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 border border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          title="Share via WhatsApp"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mr-1">
        Share:
      </span>

      {/* Device native share (mobile / supported browsers) */}
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-surface border border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
          title="Share via device options"
        >
          <Share2 className="w-3.5 h-3.5 text-primary" />
          <span>Share</span>
        </button>
      )}

      {/* Copy link */}
      <button
        type="button"
        onClick={copyToClipboard}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer",
          copied
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
        )}
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* X / Twitter */}
      <a
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-surface border border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
        title="Share on X"
      >
        <XIcon className="w-3.5 h-3.5" />
        <span>X</span>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-surface border border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
        title="Share on LinkedIn"
      >
        <LinkedinIcon className="w-3.5 h-3.5" />
        <span>LinkedIn</span>
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-surface border border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
        title="Share via WhatsApp"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
