"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  File,
  Image as ImageIcon,
  Upload,
  Video,
  X,
} from "lucide-react";
import { HexChip } from "@/components/hex/hex-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadFolder =
  | "portfolio/projects"
  | "portfolio/studio"
  | "portfolio/articles"
  | "portfolio/profile"
  | "portfolio/media";

export type UploadResourceType = "image" | "video" | "auto";

export interface UploadedAsset {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: "image" | "video";
  dominantColor?: string;
}

interface FileUploadState {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  asset?: UploadedAsset;
  error?: string;
  abort?: AbortController;
}

interface MediaUploaderProps {
  folder?: UploadFolder;
  resourceType?: UploadResourceType;
  maxFiles?: number;
  maxFileSizeMb?: number;
  onUploadComplete?: (assets: UploadedAsset[]) => void;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function MediaUploader({
  folder = "portfolio/media",
  resourceType = "auto",
  maxFiles = 10,
  maxFileSizeMb = 50,
  onUploadComplete,
  className,
}: MediaUploaderProps) {
  const [files, setFiles] = React.useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const acceptedTypes =
    resourceType === "image"
      ? "image/*"
      : resourceType === "video"
        ? "video/*"
        : "image/*,video/*";

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;

    const toAdd: FileUploadState[] = [];
    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;

    for (const file of Array.from(incoming)) {
      if (files.length + toAdd.length >= maxFiles) break;
      if (file.size > maxSizeBytes) {
        toAdd.push({
          file,
          id: crypto.randomUUID(),
          status: "error",
          progress: 0,
          error: `File exceeds ${maxFileSizeMb}MB limit`,
        });
        continue;
      }
      toAdd.push({
        file,
        id: crypto.randomUUID(),
        status: "pending",
        progress: 0,
      });
    }

    setFiles((prev) => [...prev, ...toAdd]);
  }

  async function uploadFile(fileState: FileUploadState) {
    const abort = new AbortController();

    // Mark as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileState.id ? { ...f, status: "uploading", abort } : f
      )
    );

    try {
      // 1. Get signed upload params from the server
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, resourceType }),
        signal: abort.signal,
      });

      if (!signRes.ok) throw new Error("Failed to get upload signature");

      const {
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder: signedFolder,
      } = await signRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", fileState.file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", signedFolder);

      const cloudinaryResourceType = fileState.file.type.startsWith("video/")
        ? "video"
        : "image";

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${cloudinaryResourceType}/upload`,
        {
          method: "POST",
          body: formData,
          signal: abort.signal,
        }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        throw new Error(`Cloudinary upload failed: ${err}`);
      }

      const cloudData = await uploadRes.json();

      const asset: UploadedAsset = {
        publicId: cloudData.public_id,
        url: cloudData.secure_url,
        width: cloudData.width,
        height: cloudData.height,
        format: cloudData.format,
        bytes: cloudData.bytes,
        resourceType: cloudinaryResourceType,
        dominantColor: cloudData.predominant?.google?.[0]?.[0] ?? undefined,
      };

      // 3. Save to database
      await fetch("/api/uploads/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: asset.publicId,
          type: asset.resourceType,
          width: asset.width,
          height: asset.height,
          format: asset.format,
          bytes: asset.bytes,
          dominantColor: asset.dominantColor,
          altText: fileState.file.name.replace(/\.[^/.]+$/, ""),
          folder,
        }),
        signal: abort.signal,
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileState.id
            ? { ...f, status: "done", progress: 100, asset }
            : f
        )
      );

      // Notify parent of completed assets
      setFiles((prev) => {
        const doneAssets = prev
          .filter((f) => f.status === "done" && f.asset)
          .map((f) => f.asset!);
        onUploadComplete?.(doneAssets);
        return prev;
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileState.id
              ? { ...f, status: "error", error: "Upload cancelled" }
              : f
          )
        );
        return;
      }
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileState.id
            ? {
                ...f,
                status: "error",
                error: (err as Error).message || "Upload failed",
              }
            : f
        )
      );
    }
  }

  function startAll() {
    files
      .filter((f) => f.status === "pending")
      .forEach((f) => uploadFile(f));
  }

  function cancelFile(id: string) {
    setFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      found?.abort?.abort();
      return prev.filter((f) => f.id !== id);
    });
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border bg-background p-10 text-center transition-colors cursor-pointer",
          isDragging && "border-primary bg-surface"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <Upload
          className={cn(
            "h-8 w-8 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            Drop files here or click to browse
          </p>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {resourceType === "image"
              ? "Images up to"
              : resourceType === "video"
                ? "Videos up to"
                : "Images & Videos up to"}{" "}
            {maxFileSizeMb}MB · Max {maxFiles} files
          </p>
        </div>
        <div className="flex gap-2">
          <HexChip variant="muted" size="sm">
            {folder.replace("portfolio/", "")}
          </HexChip>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes}
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {doneCount}/{files.length} uploaded
            </span>
            {pendingCount > 0 && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={startAll}
              >
                Upload All ({pendingCount})
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((fileState) => (
              <FileRow
                key={fileState.id}
                fileState={fileState}
                onCancel={() => cancelFile(fileState.id)}
                onUpload={() => uploadFile(fileState)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({
  fileState,
  onCancel,
  onUpload,
}: {
  fileState: FileUploadState;
  onCancel: () => void;
  onUpload: () => void;
}) {
  const isImage = fileState.file.type.startsWith("image/");
  const Icon = isImage ? ImageIcon : fileState.file.type.startsWith("video/") ? Video : File;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border border-border bg-surface p-3 transition-colors",
        fileState.status === "done" && "border-success/50",
        fileState.status === "error" && "border-danger/50"
      )}
    >
      <div className="flex h-9 w-8 flex-shrink-0 items-center justify-center bg-background text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {fileState.file.name}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground uppercase">
          {formatBytes(fileState.file.size)}
          {fileState.status === "uploading" && ` · Uploading…`}
          {fileState.status === "done" && ` · Done`}
          {fileState.status === "error" && ` · ${fileState.error}`}
        </p>

        {fileState.status === "uploading" && (
          <div className="mt-1.5 h-1 w-full bg-background overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${fileState.progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {fileState.status === "done" && (
          <CheckCircle2 className="h-4 w-4 text-success" />
        )}
        {fileState.status === "error" && (
          <AlertCircle className="h-4 w-4 text-danger" />
        )}
        {fileState.status === "pending" && (
          <Button type="button" variant="outline" size="sm" onClick={onUpload}>
            Upload
          </Button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-danger transition-colors cursor-pointer"
          aria-label="Remove file"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
