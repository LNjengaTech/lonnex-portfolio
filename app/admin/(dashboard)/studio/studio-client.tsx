"use client";

import * as React from "react";
import {
  Check,
  CheckSquare,
  Copy,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Loader2,
  Lock,
  Palette,
  Pencil,
  Plus,
  Save,
  Square,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SortableListItem } from "@/components/admin/sortable-list-item";
import { MediaPicker, type MediaAsset } from "@/components/admin/media-picker";
import {
  createStudioItemAction,
  updateStudioItemAction,
  deleteStudioItemAction,
  reorderStudioItemsAction,
  togglePublishStudioItemAction,
  bulkCreateStudioItemsAction,
  bulkUpdateStudioItemsCategoryAction,
  bulkDeleteStudioItemsAction,
  createStudioCategoryAction,
  updateStudioCategoryAction,
  deleteStudioCategoryAction,
  createStudioCollectionAction,
  updateStudioCollectionAction,
  deleteStudioCollectionAction,
} from "./actions";
import type {
  StudioItemInput,
  StudioCategoryInput,
  StudioCollectionInput,
} from "@/lib/validators/studio";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";

interface StudioItemRecord extends StudioItemInput {
  id: number;
}

interface StudioCategoryRecord extends StudioCategoryInput {
  id: number;
}

interface StudioCollectionRecord extends StudioCollectionInput {
  id: number;
}

interface StudioClientProps {
  initialItems: StudioItemRecord[];
  initialCategories: StudioCategoryRecord[];
  initialCollections: StudioCollectionRecord[];
  mediaAssets: MediaAsset[];
}

function calculateAspectRatio(w: number, h: number): string {
  if (!w || !h) return "1:1";
  const ratio = w / h;
  if (ratio >= 2.5) return "3:1";
  if (ratio >= 1.6) return "16:9";
  if (ratio >= 1.25) return "4:3";
  if (ratio >= 0.95 && ratio <= 1.05) return "1:1";
  if (ratio <= 0.4) return "1:3";
  if (ratio <= 0.65) return "9:16";
  return "3:4";
}

export function StudioClient({
  initialItems,
  initialCategories,
  initialCollections,
  mediaAssets,
}: StudioClientProps) {
  const [activeTab, setActiveTab] = React.useState("wall");

  // ==========================================
  // 1. STUDIO ITEMS STATE
  // ==========================================
  const [items, setItems] = React.useState<StudioItemRecord[]>(initialItems);
  const [categories, setCategories] =
    React.useState<StudioCategoryRecord[]>(initialCategories);
  const [collections, setCollections] =
    React.useState<StudioCollectionRecord[]>(initialCollections);

  const [categoryFilter, setCategoryFilter] = React.useState<number | "all">(
    "all"
  );
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [isPending, startTransition] = React.useTransition();

  // Single Item Modal
  const [itemDialogOpen, setItemDialogOpen] = React.useState(false);
  const [editingItemId, setEditingItemId] = React.useState<number | null>(null);
  const [itemForm, setItemForm] = React.useState<StudioItemInput>({
    title: "",
    categoryId: categories[0]?.id || 1,
    collectionId: null,
    mediaType: "image",
    mediaUrl: "",
    cloudinaryId: "",
    width: 1000,
    height: 1000,
    ratio: "1:1",
    specLabel: "Rollup Banner / 85x200cm",
    year: new Date().getFullYear().toString(),
    confidential: false,
    order: 0,
    published: true,
  });
  const [showItemMediaPicker, setShowItemMediaPicker] = React.useState(false);

  // Bulk Ingest Modal & Selected Staging
  const [showBulkMediaPicker, setShowBulkMediaPicker] = React.useState(false);
  const [stagingBulkItems, setStagingBulkItems] = React.useState<
    Array<StudioItemInput & { tempId: string }>
  >([]);

  // Category & Collection Modals
  const [catDialogOpen, setCatDialogOpen] = React.useState(false);
  const [editingCatId, setEditingCatId] = React.useState<number | null>(null);
  const [catForm, setCatForm] = React.useState<StudioCategoryInput>({
    name: "",
    slug: "",
    order: 0,
    published: true,
  });

  const [colDialogOpen, setColDialogOpen] = React.useState(false);
  const [editingColId, setEditingColId] = React.useState<number | null>(null);
  const [colForm, setColForm] = React.useState<StudioCollectionInput>({
    title: "",
    slug: "",
    description: "",
    order: 0,
    published: true,
  });

  const filteredItems = items.filter((item) => {
    if (categoryFilter === "all") return true;
    return item.categoryId === categoryFilter;
  });

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const toggleSelectItem = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (!confirm(`Delete ${ids.length} selected artwork items?`)) return;

    startTransition(async () => {
      const res = await bulkDeleteStudioItemsAction(ids);
      if (res.success) {
        setItems(items.filter((i) => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
      }
    });
  };

  const handleBulkChangeCategory = (targetCatId: number) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    startTransition(async () => {
      const res = await bulkUpdateStudioItemsCategoryAction(ids, targetCatId);
      if (res.success) {
        setItems(
          items.map((i) =>
            selectedIds.has(i.id) ? { ...i, categoryId: targetCatId } : i
          )
        );
        setSelectedIds(new Set());
      }
    });
  };

  // Item Handlers
  const handleOpenCreateItem = () => {
    setEditingItemId(null);
    setItemForm({
      title: "",
      categoryId: categories[0]?.id || 1,
      collectionId: null,
      mediaType: "image",
      mediaUrl: "",
      cloudinaryId: "",
      width: 1000,
      height: 1000,
      ratio: "1:1",
      specLabel: "Rollup Banner / 85x200cm",
      year: new Date().getFullYear().toString(),
      confidential: false,
      order: items.length + 1,
      published: true,
    });
    setItemDialogOpen(true);
  };

  const handleOpenEditItem = (item: StudioItemRecord) => {
    setEditingItemId(item.id);
    setItemForm({
      title: item.title,
      categoryId: item.categoryId,
      collectionId: item.collectionId,
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      cloudinaryId: item.cloudinaryId,
      width: item.width,
      height: item.height,
      ratio: item.ratio,
      specLabel: item.specLabel,
      year: item.year,
      confidential: item.confidential,
      order: item.order,
      published: item.published,
    });
    setItemDialogOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingItemId) {
        const res = await updateStudioItemAction(editingItemId, itemForm);
        if (res.success) {
          setItems(
            items.map((i) =>
              i.id === editingItemId ? { ...i, ...itemForm } : i
            )
          );
          setItemDialogOpen(false);
        }
      } else {
        const res = await createStudioItemAction({
          ...itemForm,
          order: items.length + 1,
        });
        if (res.success && res.item) {
          setItems([...items, res.item as StudioItemRecord]);
          setItemDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteItem = (id: number) => {
    startTransition(async () => {
      const res = await deleteStudioItemAction(id);
      if (res.success) {
        setItems(items.filter((i) => i.id !== id));
      }
    });
  };

  const handleMoveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setItems(reordered);
    startTransition(async () => {
      await reorderStudioItemsAction(reordered.map((i) => i.id));
    });
  };

  const handleTogglePublishItem = (id: number, current: boolean) => {
    const next = !current;
    setItems(items.map((i) => (i.id === id ? { ...i, published: next } : i)));
    startTransition(async () => {
      await togglePublishStudioItemAction(id, next);
    });
  };

  // Bulk Ingest Handlers
  const handleStageBulkAssets = (selectedAssets: MediaAsset[]) => {
    const defaultCatId = categories[0]?.id || 1;
    const staged: Array<StudioItemInput & { tempId: string }> = selectedAssets.map(
      (a, idx) => {
        const ratio = calculateAspectRatio(a.width, a.height);
        return {
          tempId: `${a.id}-${idx}`,
          title: a.altText || a.publicId.split("/").pop() || "Studio Artwork",
          categoryId: defaultCatId,
          collectionId: null,
          mediaType: a.type,
          mediaUrl: resolveMediaUrl(a.publicId, {
            type: a.type,
            width: a.width || 1200,
            height: a.height || 1200,
          }),
          cloudinaryId: a.publicId,
          width: a.width || 1000,
          height: a.height || 1000,
          ratio,
          specLabel:
            ratio === "1:3"
              ? "Rollup Banner / 85x200cm"
              : ratio === "16:9"
              ? "Digital Billboard / 1920x1080"
              : "Commercial Artwork / Print & Web",
          year: new Date().getFullYear().toString(),
          confidential: false,
          order: items.length + idx + 1,
          published: true,
        };
      }
    );
    setStagingBulkItems(staged);
    setActiveTab("bulk");
  };

  const handleCommitBulkImport = () => {
    if (stagingBulkItems.length === 0) return;

    startTransition(async () => {
      const res = await bulkCreateStudioItemsAction({
        items: stagingBulkItems.map(({ tempId, ...rest }) => rest),
      });
      if (res.success) {
        alert(`Successfully imported ${res.count} artwork items to Studio Wall!`);
        window.location.reload();
      }
    });
  };

  // Category & Collection Handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingCatId) {
        const res = await updateStudioCategoryAction(editingCatId, catForm);
        if (res.success) {
          setCategories(
            categories.map((c) =>
              c.id === editingCatId ? { ...c, ...catForm } : c
            )
          );
          setCatDialogOpen(false);
        }
      } else {
        const res = await createStudioCategoryAction({
          ...catForm,
          order: categories.length + 1,
        });
        if (res.success && res.category) {
          setCategories([
            ...categories,
            res.category as StudioCategoryRecord,
          ]);
          setCatDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteCategory = (id: number) => {
    startTransition(async () => {
      const res = await deleteStudioCategoryAction(id);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    });
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingColId) {
        const res = await updateStudioCollectionAction(editingColId, colForm);
        if (res.success) {
          setCollections(
            collections.map((c) =>
              c.id === editingColId ? { ...c, ...colForm } : c
            )
          );
          setColDialogOpen(false);
        }
      } else {
        const res = await createStudioCollectionAction({
          ...colForm,
          order: collections.length + 1,
        });
        if (res.success && res.collection) {
          setCollections([
            ...collections,
            res.collection as StudioCollectionRecord,
          ]);
          setColDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteCollection = (id: number) => {
    startTransition(async () => {
      const res = await deleteStudioCollectionAction(id);
      if (res.success) {
        setCollections(collections.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="wall">Studio Wall ({items.length})</TabsTrigger>
          <TabsTrigger value="bulk">
            Bulk Ingest {stagingBulkItems.length > 0 && `(${stagingBulkItems.length})`}
          </TabsTrigger>
          <TabsTrigger value="taxonomies">Categories & Sets</TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: STUDIO WALL ASSETS                  */}
        {/* ========================================== */}
        <TabsContent value="wall" className="space-y-4 pt-4">
          {/* Action and Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono uppercase border transition-colors cursor-pointer",
                  categoryFilter === "all"
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                All Wall
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono uppercase border transition-colors cursor-pointer",
                    categoryFilter === c.id
                      ? "border-primary bg-primary text-primary-foreground font-bold"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkMediaPicker(true)}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                Bulk Select Assets
              </Button>
              <HexButton
                type="button"
                variant="default"
                size="sm"
                onClick={handleOpenCreateItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1 inline" />
                Add Artwork
              </HexButton>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-background border border-border text-xs font-mono">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {selectedIds.size === filteredItems.length ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>
                    {selectedIds.size === filteredItems.length
                      ? "Deselect All"
                      : "Select All"}
                  </span>
                </button>
                <span className="text-muted-foreground">
                  ({selectedIds.size} selected)
                </span>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    className="h-8 text-xs w-44"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val) handleBulkChangeCategory(val);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Move to Category...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8 hover:text-danger hover:border-danger/40"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Studio Items List */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center border border-border bg-surface space-y-2">
              <Palette className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No studio artwork found in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, idx) => {
                const isSelected = selectedIds.has(item.id);
                const catName =
                  categories.find((c) => c.id === item.categoryId)?.name ||
                  "General";
                const colTitle = collections.find(
                  (c) => c.id === item.collectionId
                )?.title;

                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-primary cursor-pointer flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <SortableListItem
                        id={item.id}
                        index={idx}
                        total={filteredItems.length}
                        isPublished={item.published}
                        onMoveUp={() => handleMoveItem(idx, idx - 1)}
                        onMoveDown={() => handleMoveItem(idx, idx + 1)}
                        onTogglePublished={() =>
                          handleTogglePublishItem(item.id, item.published)
                        }
                        onEdit={() => handleOpenEditItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Aspect Ratio Pill */}
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-border bg-background text-primary">
                            {item.ratio}
                          </span>

                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground truncate">
                                {item.title}
                              </span>
                              <span className="font-mono text-[9px] text-muted-foreground bg-background px-1.5 py-0.2 border border-border uppercase">
                                {catName}
                              </span>
                              {colTitle && (
                                <span className="font-mono text-[9px] text-muted-foreground border border-border px-1.5 py-0.2">
                                  Set: {colTitle}
                                </span>
                              )}
                              {item.confidential && (
                                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase text-warning border border-warning/30 px-1 py-0.2 bg-warning/10">
                                  <Lock className="h-2.5 w-2.5" /> Confidential
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                              <span className="text-[10px]">{item.specLabel}</span>
                              <span>·</span>
                              <span className="text-[10px]">{item.year}</span>
                              <span>·</span>
                              <span className="text-[10px]">
                                {item.width}x{item.height}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SortableListItem>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: BULK ASSET INGEST                   */}
        {/* ========================================== */}
        <TabsContent value="bulk" className="space-y-4 pt-4">
          <div className="border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Bulk Artwork Ingestion Staging
                </h3>
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Select multiple files from the media library, auto-detect ratios, and publish in one click
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkMediaPicker(true)}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                Select Assets from Media Library
              </Button>
            </div>

            {stagingBulkItems.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border bg-background space-y-3">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-mono text-xs uppercase text-muted-foreground">
                  No assets staged for bulk import.
                </p>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setShowBulkMediaPicker(true)}
                >
                  Open Media Library Selector
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-foreground">
                    {stagingBulkItems.length} items ready to ingest
                  </span>
                  <HexButton
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleCommitBulkImport}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3.5 w-3.5 inline mr-1" />
                    )}
                    Import All {stagingBulkItems.length} to Studio Wall
                  </HexButton>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {stagingBulkItems.map((staged, idx) => (
                    <div
                      key={staged.tempId}
                      className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-border bg-background items-center text-xs font-mono"
                    >
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] uppercase text-muted-foreground">
                          Title
                        </label>
                        <Input
                          value={staged.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStagingBulkItems(
                              stagingBulkItems.map((s, i) =>
                                i === idx ? { ...s, title: val } : s
                              )
                            );
                          }}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground">
                          Category
                        </label>
                        <Select
                          value={String(staged.categoryId)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setStagingBulkItems(
                              stagingBulkItems.map((s, i) =>
                                i === idx ? { ...s, categoryId: val } : s
                              )
                            );
                          }}
                          className="h-8 text-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground">
                          Spec Label
                        </label>
                        <Input
                          value={staged.specLabel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStagingBulkItems(
                              stagingBulkItems.map((s, i) =>
                                i === idx ? { ...s, specLabel: val } : s
                              )
                            );
                          }}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-4">
                        <span className="font-bold text-primary border border-border px-1.5 py-0.5">
                          {staged.ratio}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setStagingBulkItems(
                              stagingBulkItems.filter((_, i) => i !== idx)
                            )
                          }
                          className="p-1 hover:text-danger cursor-pointer"
                          title="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: CATEGORIES & SETS (COLLECTIONS)     */}
        {/* ========================================== */}
        <TabsContent value="taxonomies" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Management */}
            <div className="border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Studio Categories
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">
                    Filter chips on the public studio wall
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCatId(null);
                    setCatForm({
                      name: "",
                      slug: "",
                      order: categories.length + 1,
                      published: true,
                    });
                    setCatDialogOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 border border-border bg-background text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-foreground">{c.name}</span>
                      <span className="text-muted-foreground ml-2">
                        /{c.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(c.id);
                          setCatForm({
                            name: c.name,
                            slug: c.slug,
                            order: c.order,
                            published: c.published,
                          });
                          setCatDialogOpen(true);
                        }}
                        className="p-1 hover:text-primary cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1 hover:text-danger cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collections Management */}
            <div className="border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Project Sets / Collections
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">
                    Grouped artwork stacks that fan out on click
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingColId(null);
                    setColForm({
                      title: "",
                      slug: "",
                      description: "",
                      order: collections.length + 1,
                      published: true,
                    });
                    setColDialogOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {collections.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border text-xs font-mono text-muted-foreground">
                    No collections defined.
                  </div>
                ) : (
                  collections.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between p-3 border border-border bg-background text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-foreground">
                          {col.title}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          /{col.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingColId(col.id);
                            setColForm({
                              title: col.title,
                              slug: col.slug,
                              description: col.description || "",
                              order: col.order,
                              published: col.published,
                            });
                            setColDialogOpen(true);
                          }}
                          className="p-1 hover:text-primary cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col.id)}
                          className="p-1 hover:text-danger cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Single Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItemId ? "Edit Studio Artwork" : "New Studio Artwork"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Artwork Title
              </label>
              <Input
                value={itemForm.title}
                onChange={(e) =>
                  setItemForm({ ...itemForm, title: e.target.value })
                }
                placeholder="Tech Expo 2026 Rollup Banner"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Category
                </label>
                <Select
                  value={String(itemForm.categoryId)}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      categoryId: parseInt(e.target.value, 10),
                    })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Collection (Optional)
                </label>
                <Select
                  value={itemForm.collectionId ? String(itemForm.collectionId) : ""}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      collectionId: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                >
                  <option value="">None (Individual)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Media URL or Cloudinary ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={itemForm.mediaUrl}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      mediaUrl: e.target.value,
                      cloudinaryId: e.target.value,
                    })
                  }
                  placeholder="Asset URL or Cloudinary public ID"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowItemMediaPicker(true)}
                  className="px-2.5 py-1 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Width (px)
                </label>
                <Input
                  type="number"
                  value={itemForm.width}
                  onChange={(e) => {
                    const w = parseInt(e.target.value, 10) || 1000;
                    setItemForm({
                      ...itemForm,
                      width: w,
                      ratio: calculateAspectRatio(w, itemForm.height),
                    });
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Height (px)
                </label>
                <Input
                  type="number"
                  value={itemForm.height}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10) || 1000;
                    setItemForm({
                      ...itemForm,
                      height: h,
                      ratio: calculateAspectRatio(itemForm.width, h),
                    });
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Ratio
                </label>
                <Input
                  value={itemForm.ratio}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, ratio: e.target.value })
                  }
                  placeholder="16:9, 1:1, 1:3..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Spec Label
                </label>
                <Input
                  value={itemForm.specLabel}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, specLabel: e.target.value })
                  }
                  placeholder="Rollup Banner / 85x200cm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Year
                </label>
                <Input
                  value={itemForm.year}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, year: e.target.value })
                  }
                  placeholder="2026"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between border border-border p-3 bg-background">
              <span className="text-xs font-mono uppercase text-warning">
                Confidential Artwork (Blurred)
              </span>
              <Switch
                checked={itemForm.confidential}
                onCheckedChange={(checked) =>
                  setItemForm({ ...itemForm, confidential: checked })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItemDialogOpen(false)}
              >
                Cancel
              </Button>
              <HexButton
                type="submit"
                variant="default"
                size="sm"
                disabled={isPending}
              >
                Save Artwork
              </HexButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Picker Modals */}
      {showItemMediaPicker && (
        <MediaPicker
          assets={mediaAssets}
          onSelect={(selected) => {
            if (selected.length > 0) {
              const item = selected[0];
              const ratio = calculateAspectRatio(item.width, item.height);
              setItemForm({
                ...itemForm,
                mediaUrl: resolveMediaUrl(item.publicId, {
                  type: item.type,
                  width: item.width || 1200,
                  height: item.height || 1200,
                }),
                cloudinaryId: item.publicId,
                mediaType: item.type,
                width: item.width,
                height: item.height,
                ratio,
              });
            }
          }}
          onClose={() => setShowItemMediaPicker(false)}
        />
      )}

      {showBulkMediaPicker && (
        <MediaPicker
          assets={mediaAssets}
          multiSelect
          onSelect={handleStageBulkAssets}
          onClose={() => setShowBulkMediaPicker(false)}
        />
      )}

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingCatId ? "Edit Category" : "New Studio Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Category Name
              </label>
              <Input
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCatForm({
                    ...catForm,
                    name,
                    slug: editingCatId
                      ? catForm.slug
                      : name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, ""),
                  });
                }}
                placeholder="Rollup Banners"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Slug
              </label>
              <Input
                value={catForm.slug}
                onChange={(e) =>
                  setCatForm({ ...catForm, slug: e.target.value })
                }
                placeholder="rollup-banners"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCatDialogOpen(false)}
              >
                Cancel
              </Button>
              <HexButton type="submit" variant="default" size="sm">
                Save Category
              </HexButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collection Dialog */}
      <Dialog open={colDialogOpen} onOpenChange={setColDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingColId ? "Edit Collection" : "New Collection Set"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCollection} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Collection Title
              </label>
              <Input
                value={colForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setColForm({
                    ...colForm,
                    title,
                    slug: editingColId
                      ? colForm.slug
                      : title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, ""),
                  });
                }}
                placeholder="Brand Identity Pack"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Slug
              </label>
              <Input
                value={colForm.slug}
                onChange={(e) =>
                  setColForm({ ...colForm, slug: e.target.value })
                }
                placeholder="brand-identity-pack"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Description
              </label>
              <Textarea
                value={colForm.description || ""}
                onChange={(e) =>
                  setColForm({ ...colForm, description: e.target.value })
                }
                rows={2}
                placeholder="Cohesive collateral set fanning out on click..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setColDialogOpen(false)}
              >
                Cancel
              </Button>
              <HexButton type="submit" variant="default" size="sm">
                Save Collection
              </HexButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
