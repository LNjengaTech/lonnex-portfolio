"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Tag, Layers, Trash2, Pencil, Upload, Clock, CheckCircle2, FileEdit, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteArticleAction, createTagAction, deleteTagAction, createSeriesAction, deleteSeriesAction } from "./actions";

interface ArticleItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "scheduled" | "published";
  readingTime: number;
  publishAt: string | null;
  createdAt: string;
  tags: { id: number; name: string; slug: string }[];
}

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

interface SeriesItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  order: number;
}

interface JournalListClientProps {
  initialArticles: ArticleItem[];
  initialTags: TagItem[];
  initialSeries: SeriesItem[];
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-success/15 text-success border-success/30",
  draft: "bg-surface text-muted-foreground border-border",
  scheduled: "bg-primary/10 text-primary border-primary/30",
};

const STATUS_ICONS = {
  published: CheckCircle2,
  draft: FileEdit,
  scheduled: Clock,
};

export function JournalListClient({
  initialArticles,
  initialTags,
  initialSeries,
}: JournalListClientProps) {
  const router = useRouter();

  const [articles, setArticles] = React.useState(initialArticles);
  const [tags, setTags] = React.useState(initialTags);
  const [seriesList, setSeriesList] = React.useState(initialSeries);

  const [activeTab, setActiveTab] = React.useState<"articles" | "tags" | "series">("articles");
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  const handleCopyLink = async (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://lonnex.dev";
    const url = `${origin}/journal/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // ignore
    }
  };

  // ── Import modal state ────────────────────────────────────────────────────
  const [showImport, setShowImport] = React.useState(false);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importStatus, setImportStatus] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Tag creation ──────────────────────────────────────────────────────────
  const [newTagName, setNewTagName] = React.useState("");
  const [newTagSlug, setNewTagSlug] = React.useState("");
  const [tagError, setTagError] = React.useState("");

  // ── Series creation ────────────────────────────────────────────────────────
  const [newSeriesTitle, setNewSeriesTitle] = React.useState("");
  const [newSeriesSlug, setNewSeriesSlug] = React.useState("");
  const [seriesError, setSeriesError] = React.useState("");

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  // ── Article delete ─────────────────────────────────────────────────────────
  async function handleDeleteArticle(id: number) {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    setBusy(true);
    const res = await deleteArticleAction(id);
    setBusy(false);
    setDeletingId(null);
    if (res.success) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
  }

  // ── Tag actions ────────────────────────────────────────────────────────────
  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    setTagError("");
    setBusy(true);
    const res = await createTagAction({ name: newTagName, slug: newTagSlug || autoSlug(newTagName) });
    setBusy(false);
    if (res.success && res.id) {
      setTags((prev) => [...prev, { id: res.id!, name: newTagName, slug: newTagSlug || autoSlug(newTagName) }]);
      setNewTagName("");
      setNewTagSlug("");
    } else {
      setTagError(res.error ?? "Error creating tag.");
    }
  }

  async function handleDeleteTag(id: number) {
    setBusy(true);
    const res = await deleteTagAction(id);
    setBusy(false);
    if (res.success) setTags((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Series actions ─────────────────────────────────────────────────────────
  async function handleCreateSeries(e: React.FormEvent) {
    e.preventDefault();
    setSeriesError("");
    setBusy(true);
    const res = await createSeriesAction({ title: newSeriesTitle, slug: newSeriesSlug || autoSlug(newSeriesTitle), order: 0 });
    setBusy(false);
    if (res.success && res.id) {
      setSeriesList((prev) => [...prev, { id: res.id!, title: newSeriesTitle, slug: newSeriesSlug || autoSlug(newSeriesTitle), description: null, order: 0 }]);
      setNewSeriesTitle("");
      setNewSeriesSlug("");
    } else {
      setSeriesError(res.error ?? "Error creating series.");
    }
  }

  async function handleDeleteSeries(id: number) {
    setBusy(true);
    const res = await deleteSeriesAction(id);
    setBusy(false);
    if (res.success) setSeriesList((prev) => prev.filter((s) => s.id !== id));
  }

  // ── File import ────────────────────────────────────────────────────────────
  async function handleImport() {
    if (!importFile) return;
    const formData = new FormData();
    formData.append("file", importFile);
    setImportStatus("Importing…");

    try {
      const res = await fetch("/api/admin/journal/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.id) {
        setImportStatus("✓ Imported! Redirecting to editor…");
        setTimeout(() => {
          router.push(`/admin/journal/${data.id}`);
        }, 800);
      } else {
        setImportStatus(`Error: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      setImportStatus("Network error during import.");
    }
  }

  const tabs = [
    { key: "articles", label: "Articles", icon: FileText, count: articles.length },
    { key: "tags", label: "Tags", icon: Tag, count: tags.length },
    { key: "series", label: "Series", icon: Layers, count: seriesList.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/journal/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Article
        </Link>

        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          Import .md / .docx
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors cursor-pointer",
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className="ml-1 font-bold text-[10px] bg-surface border border-border px-1.5 py-0.5">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Articles tab ─────────────────────────────────────────────────── */}
      {activeTab === "articles" && (
        <div className="space-y-2">
          {articles.length === 0 && (
            <div className="py-16 text-center text-muted-foreground font-mono text-sm">
              No articles yet. Write your first one above.
            </div>
          )}
          {articles.map((article) => {
            const StatusIcon = STATUS_ICONS[article.status];
            return (
              <div
                key={article.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border bg-surface"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono uppercase",
                        STATUS_STYLES[article.status]
                      )}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {article.status}
                    </span>
                    {article.tags.map((t) => (
                      <span key={t.id} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-sm text-foreground truncate">{article.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    <span>{article.readingTime} min read</span>
                    <span>{new Date(article.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    {article.publishAt && article.status === "scheduled" && (
                      <span className="text-primary">→ {new Date(article.publishAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Copy Public Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(article.slug)}
                    className={cn(
                      "p-1.5 border transition-colors cursor-pointer",
                      copiedSlug === article.slug
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary"
                    )}
                    title={copiedSlug === article.slug ? "Copied!" : "Copy public share link"}
                  >
                    {copiedSlug === article.slug ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>

                  {/* View on Site (if published) */}
                  {article.status === "published" && (
                    <a
                      href={`/journal/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      title="View public article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <Link
                    href={`/admin/journal/${article.id}`}
                    className="p-1.5 border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteArticle(article.id)}
                    className={cn(
                      "p-1.5 border transition-colors cursor-pointer font-mono text-[10px] uppercase",
                      deletingId === article.id
                        ? "border-danger bg-danger text-danger-foreground font-bold px-2"
                        : "border-border bg-background text-muted-foreground hover:text-danger hover:border-danger/40"
                    )}
                    title={deletingId === article.id ? "Click again to confirm delete" : "Delete"}
                  >
                    {deletingId === article.id ? "Confirm?" : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tags tab ─────────────────────────────────────────────────────── */}
      {activeTab === "tags" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateTag} className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Tag name</label>
              <input
                value={newTagName}
                onChange={(e) => {
                  setNewTagName(e.target.value);
                  if (!newTagSlug) setNewTagSlug(autoSlug(e.target.value));
                }}
                placeholder="e.g. TypeScript"
                className="border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-44"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Slug</label>
              <input
                value={newTagSlug}
                onChange={(e) => setNewTagSlug(e.target.value)}
                placeholder="typescript"
                className="border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-44"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !newTagName}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 font-mono text-xs uppercase disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add Tag
            </button>
          </form>
          {tagError && <p className="text-xs text-danger font-mono">{tagError}</p>}

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5">
                <span className="font-mono text-xs text-foreground">#{tag.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">/{tag.slug}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={busy}
                  className="ml-1 text-muted-foreground hover:text-danger transition-colors cursor-pointer"
                  title="Delete tag"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground font-mono">No tags yet.</p>
          )}
        </div>
      )}

      {/* ── Series tab ────────────────────────────────────────────────────── */}
      {activeTab === "series" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateSeries} className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Series title</label>
              <input
                value={newSeriesTitle}
                onChange={(e) => {
                  setNewSeriesTitle(e.target.value);
                  if (!newSeriesSlug) setNewSeriesSlug(autoSlug(e.target.value));
                }}
                placeholder="e.g. Building a Hive"
                className="border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-56"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Slug</label>
              <input
                value={newSeriesSlug}
                onChange={(e) => setNewSeriesSlug(e.target.value)}
                placeholder="building-a-hive"
                className="border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-44"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !newSeriesTitle}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 font-mono text-xs uppercase disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add Series
            </button>
          </form>
          {seriesError && <p className="text-xs text-danger font-mono">{seriesError}</p>}

          <div className="space-y-2">
            {seriesList.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 border border-border bg-surface">
                <div>
                  <p className="font-bold text-sm text-foreground">{s.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">/{s.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSeries(s.id)}
                  disabled={busy}
                  className="p-1.5 text-muted-foreground hover:text-danger transition-colors cursor-pointer border border-transparent hover:border-danger/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {seriesList.length === 0 && (
              <p className="text-sm text-muted-foreground font-mono">No series yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Import modal ──────────────────────────────────────────────────── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-border bg-surface p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-lg tracking-tight text-foreground">Import Article</h3>
            <p className="text-xs text-muted-foreground">
              Drag a <strong>.md</strong> or <strong>.docx</strong> file. Front matter (title, tags, date) will be parsed automatically. You can review in the editor before publishing.
            </p>

            <div
              className="border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setImportFile(file);
              }}
            >
              {importFile ? (
                <p className="font-mono text-sm text-foreground">{importFile.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click or drop file here</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.mdx,.docx"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {importStatus && (
              <p className="font-mono text-xs text-primary">{importStatus}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={!importFile || !!importStatus}
                className="flex-1 bg-primary text-primary-foreground py-2 font-mono text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                Import
              </button>
              <button
                type="button"
                onClick={() => { setShowImport(false); setImportFile(null); setImportStatus(""); }}
                className="flex-1 border border-border bg-background py-2 font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
