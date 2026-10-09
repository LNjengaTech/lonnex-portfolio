"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CloudImage } from "@/components/site/cloud-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/components/admin/media-picker";

interface AltTextEditorProps {
  asset: MediaAsset;
  onSave: (id: number, altText: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function AltTextEditor({ asset, onSave, onDelete }: AltTextEditorProps) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(asset.altText);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function save() {
    setSaving(true);
    await onSave(asset.id, value);
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this asset from Cloudinary and the database?")) return;
    setDeleting(true);
    await onDelete(asset.id);
    setDeleting(false);
  }

  return (
    <div className="space-y-2">
      {editing ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-xs h-8"
            chamfer={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
              if (e.key === "Escape") setEditing(false);
            }}
            autoFocus
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-xs text-muted-foreground truncate">
            {asset.altText || "No alt text"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-primary cursor-pointer"
            aria-label="Edit alt text"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground hover:text-danger cursor-pointer"
            aria-label="Delete asset"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface MediaLibraryClientProps {
  initialAssets: MediaAsset[];
}

export function MediaLibraryClient({ initialAssets }: MediaLibraryClientProps) {
  const [assets, setAssets] = React.useState(initialAssets);

  async function handleSaveAlt(id: number, altText: string) {
    await fetch("/api/uploads/media/alt", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, altText }),
    });
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, altText } : a))
    );
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/uploads/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete asset from Cloudinary");
      }
    } catch {
      alert("Network error: Could not complete deletion.");
    }
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border bg-background py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          No media assets yet. Upload some files to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="border border-border bg-surface p-2 space-y-2"
        >
          {/* Thumbnail */}
          <div className="relative aspect-square overflow-hidden bg-background">
            {asset.type === "image" ? (
              <CloudImage
                publicId={asset.publicId}
                alt={asset.altText || asset.publicId}
                width={200}
                height={200}
                fill
                dominantColor={asset.dominantColor ?? undefined}
                sizes="200px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Badge variant="secondary">Video</Badge>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge
                variant={asset.type === "video" ? "default" : "secondary"}
                shape="square"
              >
                {asset.format}
              </Badge>
              <span className="font-mono text-[9px] text-muted-foreground">
                {asset.width}×{asset.height}
              </span>
            </div>
            <AltTextEditor
              asset={asset}
              onSave={handleSaveAlt}
              onDelete={handleDelete}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
