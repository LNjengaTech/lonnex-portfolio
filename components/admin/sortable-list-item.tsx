"use client";

import * as React from "react";
import {
  ChevronUp,
  ChevronDown,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListItemProps {
  id: number;
  index: number;
  total: number;
  isPublished?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onTogglePublished?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export function SortableListItem({
  id,
  index,
  total,
  isPublished = true,
  onMoveUp,
  onMoveDown,
  onTogglePublished,
  onEdit,
  onDelete,
  draggable = true,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  className,
}: SortableListItemProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = () => {
    if (isDeleting) {
      onDelete?.();
      setIsDeleting(false);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3500);
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border bg-surface transition-all",
        isPublished ? "border-border" : "border-border/60 opacity-75 bg-surface/50",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag Handle and Order index */}
        <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
          {draggable && (
            <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground" />
          )}
          <span className="font-mono text-[10px] w-5 text-center text-muted-foreground">
            #{index + 1}
          </span>
        </div>

        {/* Custom Item Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
        {/* Move Up */}
        {onMoveUp && (
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1 border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Move up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Move Down */}
        {onMoveDown && (
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="p-1 border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Move down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Published Toggle */}
        {onTogglePublished && (
          <button
            type="button"
            onClick={onTogglePublished}
            className={cn(
              "px-2 py-1 border text-xs font-mono uppercase transition-colors cursor-pointer flex items-center gap-1",
              isPublished
                ? "border-border bg-background text-foreground hover:border-primary"
                : "border-border bg-surface text-muted-foreground line-through"
            )}
            title={isPublished ? "Click to unpublish" : "Click to publish"}
          >
            {isPublished ? (
              <Eye className="h-3 w-3 text-primary" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
            <span className="text-[10px]">{isPublished ? "Pub" : "Draft"}</span>
          </button>
        )}

        {/* Edit Button */}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
            title="Edit item"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete with Confirm */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className={cn(
              "p-1.5 border transition-colors cursor-pointer font-mono text-[10px] uppercase",
              isDeleting
                ? "border-danger bg-danger text-danger-foreground font-bold px-2"
                : "border-border bg-background text-muted-foreground hover:text-danger hover:border-danger/40"
            )}
            title={isDeleting ? "Click again to confirm delete" : "Delete item"}
          >
            {isDeleting ? "Confirm?" : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
