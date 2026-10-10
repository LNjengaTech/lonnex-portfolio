"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import {
  Bold,
  Italic,
  Code,
  Quote,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Download,
  Save,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  FileEdit,
  ChevronDown,
  ImagePlus,
  X,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createArticleAction, updateArticleAction } from "../actions";
import type { ArticleInput } from "@/lib/validators/articles";
import { MediaPicker, type MediaAsset } from "@/components/admin/media-picker";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";

const lowlight = createLowlight(common);

interface TagItem { id: number; name: string; slug: string }
interface SeriesItem { id: number; title: string; slug: string; description: string | null; order: number }

interface InitialData {
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "scheduled" | "published";
  readingTime: number;
  publishAt: string | null;
  tagIds: number[];
  coverUrl: string | null;
  contentJson: Record<string, unknown>;
  seriesId: number | null;
  seriesPart: number | null;
  seo: { title?: string | null; description?: string | null; ogImageUrl?: string | null; ogSection?: string | null } | null;
  canonicalUrl: string | null;
}

interface JournalEditorProps {
  mode: "create" | "edit";
  articleId?: number;
  initialData?: InitialData;
  allTags: TagItem[];
  allSeries: SeriesItem[];
  mediaAssets?: MediaAsset[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function estimateReadingTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const STATUS_OPTIONS: { value: ArticleInput["status"]; label: string; icon: React.ElementType; style: string }[] = [
  { value: "draft", label: "Draft", icon: FileEdit, style: "text-muted-foreground" },
  { value: "scheduled", label: "Scheduled", icon: Clock, style: "text-primary" },
  { value: "published", label: "Published", icon: CheckCircle2, style: "text-success" },
];

export function JournalEditor({ mode, articleId, initialData, allTags, allSeries, mediaAssets = [] }: JournalEditorProps) {
  const router = useRouter();

  const [title, setTitle] = React.useState(initialData?.title ?? "");
  const [slug, setSlug] = React.useState(initialData?.slug ?? "");
  const [slugManual, setSlugManual] = React.useState(mode === "edit");
  const [excerpt, setExcerpt] = React.useState(initialData?.excerpt ?? "");
  const [status, setStatus] = React.useState<ArticleInput["status"]>(initialData?.status ?? "draft");
  const [publishAt, setPublishAt] = React.useState(initialData?.publishAt ?? "");
  const [tagIds, setTagIds] = React.useState<number[]>(initialData?.tagIds ?? []);
  const [seriesId, setSeriesId] = React.useState<number | null>(initialData?.seriesId ?? null);
  const [seriesPart, setSeriesPart] = React.useState<number | null>(initialData?.seriesPart ?? null);
  const [coverUrl, setCoverUrl] = React.useState(initialData?.coverUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = React.useState(initialData?.canonicalUrl ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initialData?.seo?.title ?? "");
  const [seoDesc, setSeoDesc] = React.useState(initialData?.seo?.description ?? "");
  const [ogSection, setOgSection] = React.useState(initialData?.seo?.ogSection ?? "");

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"write" | "meta" | "seo">("write");
  const [showCoverPicker, setShowCoverPicker] = React.useState(false);
  const [showInlineImagePicker, setShowInlineImagePicker] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyPublicLink = async () => {
    if (!slug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://lonnex.dev";
    const url = `${origin}/journal/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const autosaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing… use /h2, /code, /quote to insert blocks.",
        emptyEditorClass: "is-editor-empty",
      }),
      CharacterCount,
      ImageExtension.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialData?.contentJson && Object.keys(initialData.contentJson).length
      ? initialData.contentJson
      : undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        void handleSave("autosave");
      }, 30000); // autosave every 30s of inactivity
    },
  });

  // Auto-slug from title in create mode
  React.useEffect(() => {
    if (!slugManual && mode === "create") {
      setSlug(slugify(title));
    }
  }, [title, slugManual, mode]);

  React.useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const readingTime = estimateReadingTime(editor?.getText() ?? "");

  function toggleTag(id: number) {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSave(trigger: "manual" | "autosave" = "manual") {
    if (!editor) return;
    if (trigger === "manual") setSaving(true);
    setSaveError("");

    const contentJson = editor.getJSON() as Record<string, unknown>;
    const htmlCache = editor.getHTML();

    const payload: ArticleInput = {
      slug: slug || slugify(title),
      title: title || "Untitled",
      excerpt: excerpt || editor.getText().slice(0, 200),
      coverUrl: coverUrl || null,
      contentJson,
      htmlCache,
      seriesId: seriesId ?? null,
      seriesPart: seriesPart ?? null,
      status,
      publishAt: publishAt || null,
      readingTime,
      seo: (seoTitle || seoDesc || ogSection) ? { title: seoTitle || null, description: seoDesc || null, ogSection: ogSection || null } : null,
      canonicalUrl: canonicalUrl || null,
      tagIds,
    };

    const res =
      mode === "edit" && articleId
        ? await updateArticleAction(articleId, payload)
        : await createArticleAction(payload);

    if (trigger === "manual") setSaving(false);

    if (!res.success) {
      setSaveError(res.error ?? "Failed to save.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (mode === "create" && "id" in res && res.id) {
        router.replace(`/admin/journal/${res.id}`);
      }
    }
  }

  async function handleExport() {
    if (!articleId) return;
    const res = await fetch(`/api/admin/journal/${articleId}/export`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "article"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function setLink() {
    const url = window.prompt("URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status)!;
  const StatusIcon = currentStatus.icon;

  return (
    <>
    <div className="flex flex-col xl:flex-row gap-6">
      {/* ── Editor column ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title…"
          className="w-full text-2xl font-black tracking-tight bg-transparent text-foreground placeholder:text-muted-foreground/50 border-b border-border pb-2 focus:outline-none focus:border-primary"
        />

        {/* Slug */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Slug /journal/</span>
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
            placeholder="my-article-slug"
            className="font-mono text-xs text-primary bg-transparent border-b border-dashed border-border focus:outline-none focus:border-primary flex-1"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["write", "meta", "seo"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 font-mono text-[10px] uppercase tracking-wider border-b-2 transition-colors cursor-pointer",
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Write tab ──────────────────────────────────────────────────── */}
        {activeTab === "write" && (
          <div className="space-y-3">
            {/* Unified Editor Card: Sticky toolbar at top, scrollable content area */}
            <div className="border border-border bg-background flex flex-col">
              {/* Pinned Toolbar: always stays visible, never scrolls out of view */}
              <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface shadow-sm">
                {[
                  { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), label: "H2", active: () => editor?.isActive("heading", { level: 2 }) ?? false },
                  { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), label: "H3", active: () => editor?.isActive("heading", { level: 3 }) ?? false },
                  { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), label: "Bold", active: () => editor?.isActive("bold") ?? false },
                  { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), label: "Italic", active: () => editor?.isActive("italic") ?? false },
                  { icon: Code, action: () => editor?.chain().focus().toggleCode().run(), label: "Inline code", active: () => editor?.isActive("code") ?? false },
                ].map(({ icon: Icon, action, label, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    title={label}
                    className={cn(
                      "p-1.5 border transition-colors cursor-pointer",
                      active()
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
                <div className="w-px h-4 bg-border mx-1" />
                {[
                  { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), label: "Blockquote", active: () => editor?.isActive("blockquote") ?? false },
                  { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), label: "Bullet list", active: () => editor?.isActive("bulletList") ?? false },
                  { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), label: "Ordered list", active: () => editor?.isActive("orderedList") ?? false },
                  { icon: Minus, action: () => editor?.chain().focus().setHorizontalRule().run(), label: "Divider", active: () => false },
                  { icon: LinkIcon, action: setLink, label: "Link", active: () => editor?.isActive("link") ?? false },
                ].map(({ icon: Icon, action, label, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    title={label}
                    className={cn(
                      "p-1.5 border transition-colors cursor-pointer",
                      active()
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
                {/* Insert Photo button from media library */}
                <button
                  type="button"
                  onClick={() => setShowInlineImagePicker(true)}
                  title="Insert photo from media library"
                  className="flex items-center gap-1 px-2 py-1 border border-border bg-background text-foreground hover:border-primary transition-colors cursor-pointer text-xs font-mono"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline text-[10px] uppercase font-bold">Photo</span>
                </button>
                <button
                  type="button"
                  title="Code block"
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 border font-mono text-[10px] uppercase transition-colors cursor-pointer",
                    editor?.isActive("codeBlock")
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {"{ }"}
                </button>

                {/* Right side in-bar: preview toggle & reading stats */}
                <div className="ml-auto flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                  <span className="hidden sm:inline">{wordCount} words</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">{readingTime}m read</span>
                  <button
                    type="button"
                    onClick={() => setShowPreview((p) => !p)}
                    className="flex items-center gap-1 px-2 py-1 border border-border bg-background hover:text-foreground hover:border-primary transition-colors cursor-pointer text-[10px] uppercase"
                  >
                    {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showPreview ? "Edit" : "Preview"}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable writing area: contained inside the box */}
              {showPreview ? (
                <div
                  className="prose prose-invert max-w-none min-h-[520px] max-h-[70vh] overflow-y-auto p-5 bg-surface text-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() ?? "" }}
                />
              ) : (
                <div className="tiptap-editor min-h-[520px] max-h-[70vh] overflow-y-auto p-5">
                  <EditorContent editor={editor} />
                </div>
              )}
            </div>
          </div>
        )}


        {/* ── Meta tab ──────────────────────────────────────────────────── */}
        {activeTab === "meta" && (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Excerpt *</span>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder="One sentence summary shown in the article list and SEO…"
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
              />
              <span className="font-mono text-[9px] text-muted-foreground">{excerpt.length}/400</span>
            </label>

            {/* Cover Image — MediaPicker */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Cover image</span>
              {coverUrl ? (
                <div className="relative border border-border bg-surface group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt="Article cover"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCoverPicker(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-xs font-mono text-foreground hover:border-primary transition-colors cursor-pointer"
                    >
                      <ImagePlus className="h-3 w-3" />
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverUrl("")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-danger/60 text-xs font-mono text-danger hover:border-danger transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(true)}
                  className="w-full h-32 border border-dashed border-border bg-surface flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="font-mono text-[10px] uppercase">Pick from media library</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block space-y-1">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Series</span>
                <select
                  value={seriesId ?? ""}
                  onChange={(e) => setSeriesId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">— None —</option>
                  {allSeries.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Part #</span>
                <input
                  type="number"
                  min={1}
                  value={seriesPart ?? ""}
                  onChange={(e) => setSeriesPart(e.target.value ? Number(e.target.value) : null)}
                  placeholder="1"
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Canonical URL</span>
              <input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://dev.to/… (for cross-posted articles)"
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </label>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Tags</span>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3 py-1 border font-mono text-xs transition-colors cursor-pointer",
                      tagIds.includes(tag.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                    )}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
              {allTags.length === 0 && (
                <p className="text-xs text-muted-foreground font-mono">No tags yet — add them from the Journal list.</p>
              )}
            </div>
          </div>
        )}

        {/* ── SEO tab ──────────────────────────────────────────────────── */}
        {activeTab === "seo" && (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">SEO title (max 70 chars)</span>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={70}
                placeholder={title}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
              <span className="font-mono text-[9px] text-muted-foreground">{seoTitle.length}/70</span>
            </label>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Meta description (max 160 chars)</span>
              <textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder={excerpt}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
              />
              <span className="font-mono text-[9px] text-muted-foreground">{seoDesc.length}/160</span>
            </label>

            {/* SERP preview */}
            <div className="border border-border bg-surface p-4 space-y-1">
              <p className="font-mono text-[9px] uppercase text-muted-foreground mb-2">SERP Preview</p>
              <p className="text-sm font-bold text-primary">{seoTitle || title || "Article Title"}</p>
              <p className="text-[10px] font-mono text-success">lonnex.dev/journal/{slug || "article-slug"}</p>
              <p className="text-xs text-muted-foreground">{seoDesc || excerpt || "Article excerpt…"}</p>
            </div>

            {/* Open Graph section */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Open Graph (Social Sharing)</p>

              <label className="block space-y-1">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  article:section <span className="normal-case text-[9px]">(e.g. Technology, Design, Business)</span>
                </span>
                <input
                  value={ogSection}
                  onChange={(e) => setOgSection(e.target.value)}
                  maxLength={80}
                  placeholder="Technology"
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                />
              </label>

              {/* OG Card Preview */}
              <div className="border border-border bg-background overflow-hidden">
                <p className="font-mono text-[9px] uppercase text-muted-foreground px-3 pt-3 pb-1.5">OG Card Preview</p>
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-surface border-y border-border flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
                <div className="px-3 py-2 space-y-0.5">
                  {ogSection && (
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">{ogSection}</p>
                  )}
                  <p className="text-xs font-bold text-foreground leading-tight">{seoTitle || title || "Article Title"}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{seoDesc || excerpt || "Article excerpt…"}</p>
                  <p className="font-mono text-[9px] text-muted-foreground/60 uppercase">lonnex.dev</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Save error */}
        {saveError && (
          <p className="text-xs text-danger font-mono">{saveError}</p>
        )}
      </div>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div className="xl:w-72 flex-shrink-0 space-y-4">
        {/* Status picker */}
        <div className="border border-border bg-surface p-4 space-y-3">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Status</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusDropdown((p) => !p)}
              className="w-full flex items-center justify-between gap-2 border border-border bg-background px-3 py-2 text-sm font-mono cursor-pointer hover:border-primary transition-colors"
            >
              <span className={cn("flex items-center gap-2", currentStatus.style)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {currentStatus.label}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {showStatusDropdown && (
              <div className="absolute z-10 top-full left-0 right-0 border border-border bg-surface shadow-lg">
                {STATUS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setStatus(opt.value); setShowStatusDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono hover:bg-background transition-colors cursor-pointer"
                    >
                      <Icon className={cn("h-3.5 w-3.5", opt.style)} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {status === "scheduled" && (
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Publish at</span>
              <input
                type="datetime-local"
                value={publishAt ?? ""}
                onChange={(e) => setPublishAt(e.target.value)}
                className="w-full border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="border border-border bg-surface p-4 space-y-2">
          <button
            type="button"
            onClick={() => handleSave("manual")}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 font-mono text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            {saving ? (
              <span className="animate-pulse">Saving…</span>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </button>

          {slug && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="flex-1 flex items-center justify-center gap-1.5 border border-border bg-background text-muted-foreground py-2 font-mono text-xs uppercase hover:text-foreground hover:border-primary transition-colors cursor-pointer"
                title="Copy public link to clipboard"
              >
                {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Copied" : "Copy Link"}
              </button>

              {status === "published" && (
                <a
                  href={`/journal/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 px-3 border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  title="Open live article in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {mode === "edit" && articleId && (
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 border border-border bg-background text-muted-foreground py-2 font-mono text-xs uppercase hover:text-foreground hover:border-primary transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export .md
            </button>
          )}
        </div>

        {/* Word count / stats */}
        <div className="border border-border bg-surface p-4 space-y-2">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Stats</p>
          <div className="space-y-1">
            {[
              ["Words", wordCount],
              ["Read time", `${readingTime} min`],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* ── Cover Image MediaPicker Modal ──────────────────────────────────── */}
      {showCoverPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Select cover image</p>
              <button
                type="button"
                onClick={() => setShowCoverPicker(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MediaPicker
              assets={mediaAssets.filter((a) => a.type === "image")}
              filter="image"
              onSelect={(selected) => {
                if (selected[0]) {
                  setCoverUrl(resolveMediaUrl(selected[0].publicId));
                }
                setShowCoverPicker(false);
              }}
              onClose={() => setShowCoverPicker(false)}
            />
          </div>
        </div>
      )}

      {/* ── Inline Image MediaPicker Modal ──────────────────────────────────── */}
      {showInlineImagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Insert photo into article</p>
              <button
                type="button"
                onClick={() => setShowInlineImagePicker(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MediaPicker
              assets={mediaAssets.filter((a) => a.type === "image")}
              filter="image"
              onSelect={(selected) => {
                if (selected[0] && editor) {
                  const url = resolveMediaUrl(selected[0].publicId);
                  editor.chain().focus().setImage({ src: url, alt: selected[0].altText || "Article image" }).run();
                }
                setShowInlineImagePicker(false);
              }}
              onClose={() => setShowInlineImagePicker(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
