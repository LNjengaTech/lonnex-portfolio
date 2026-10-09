"use client";

import * as React from "react";
import {
  ExternalLink,
  FolderKanban,
  Globe,
  Loader2,
  Lock,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SortableListItem } from "@/components/admin/sortable-list-item";
import { HexTilePreview } from "@/components/admin/hex-tile-preview";
import { MediaPicker, type MediaAsset } from "@/components/admin/media-picker";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  reorderProjectsAction,
  togglePublishProjectAction,
} from "@/app/admin/(dashboard)/projects/actions";
import type { ProjectInput } from "@/lib/validators/projects";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";

interface ProjectItem extends ProjectInput {
  id: number;
}

interface ProjectsClientProps {
  initialProjects: ProjectItem[];
  mediaAssets: MediaAsset[];
}

export function ProjectsClient({
  initialProjects,
  mediaAssets,
}: ProjectsClientProps) {
  const [projectList, setProjectList] =
    React.useState<ProjectItem[]>(initialProjects);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [isPending, startTransition] = React.useTransition();

  // Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [activeMediaPickerField, setActiveMediaPickerField] = React.useState<
    "cover" | "video" | null
  >(null);

  // Form State
  const [formData, setFormData] = React.useState<ProjectInput>({
    slug: "",
    title: "",
    summary: "",
    role: "Full-Stack Developer",
    year: "2026",
    client: "",
    status: "completed",
    category: "web",
    tileSize: "M",
    featured: false,
    confidential: false,
    order: 0,
    coverMedia: {
      publicId: "portfolio/placeholder",
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      width: 800,
      height: 600,
      format: "jpg",
    },
    previewVideo: null,
    liveUrl: "",
    repoUrl: "",
    problem: "",
    approach: "",
    result: "",
    metrics: [],
    seo: { title: "", description: "" },
    published: true,
    stack: [],
  });

  // Stack tag input
  const [tagInput, setTagInput] = React.useState("");

  // Metric inputs
  const [metricLabel, setMetricLabel] = React.useState("");
  const [metricValue, setMetricValue] = React.useState("");

  const filteredProjects = projectList.filter((p) => {
    if (categoryFilter === "all") return true;
    return p.category === categoryFilter;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      slug: "",
      title: "",
      summary: "",
      role: "Lead Developer",
      year: new Date().getFullYear().toString(),
      client: "",
      status: "completed",
      category: "web",
      tileSize: "M",
      featured: false,
      confidential: false,
      order: projectList.length + 1,
      coverMedia: {
        publicId: "portfolio/placeholder",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        width: 800,
        height: 600,
        format: "jpg",
      },
      previewVideo: null,
      liveUrl: "",
      repoUrl: "",
      problem: "",
      approach: "",
      result: "",
      metrics: [],
      seo: { title: "", description: "" },
      published: true,
      stack: ["Next.js", "TypeScript", "Tailwind"],
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setFormData({
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      role: project.role,
      year: project.year,
      client: project.client || "",
      status: project.status,
      category: project.category,
      tileSize: project.tileSize,
      featured: project.featured,
      confidential: project.confidential,
      order: project.order,
      coverMedia: project.coverMedia,
      previewVideo: project.previewVideo || null,
      liveUrl: project.liveUrl || "",
      repoUrl: project.repoUrl || "",
      problem: project.problem,
      approach: project.approach,
      result: project.result,
      metrics: project.metrics || [],
      seo: project.seo || { title: "", description: "" },
      published: project.published,
      stack: project.stack || [],
    });
    setDialogOpen(true);
  };

  const handleSlugify = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !formData.stack.includes(val)) {
        setFormData({ ...formData, stack: [...formData.stack, val] });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      stack: formData.stack.filter((t) => t !== tag),
    });
  };

  const handleAddMetric = () => {
    if (metricLabel.trim() && metricValue.trim()) {
      setFormData({
        ...formData,
        metrics: [
          ...formData.metrics,
          { label: metricLabel.trim(), value: metricValue.trim() },
        ],
      });
      setMetricLabel("");
      setMetricValue("");
    }
  };

  const handleRemoveMetric = (index: number) => {
    setFormData({
      ...formData,
      metrics: formData.metrics.filter((_, i) => i !== index),
    });
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      if (editingId) {
        const res = await updateProjectAction(editingId, formData);
        if (res.success) {
          setProjectList(
            projectList.map((p) =>
              p.id === editingId ? { ...p, ...formData } : p
            )
          );
          setDialogOpen(false);
        } else {
          alert(res.error || "Failed to update project.");
        }
      } else {
        const res = await createProjectAction({
          ...formData,
          order: projectList.length + 1,
        });
        if (res.success && res.project) {
          setProjectList([
            ...projectList,
            { ...formData, id: res.project.id },
          ]);
          setDialogOpen(false);
        } else {
          alert(res.error || "Failed to create project.");
        }
      }
    });
  };

  const handleDeleteProject = (id: number) => {
    startTransition(async () => {
      const res = await deleteProjectAction(id);
      if (res.success) {
        setProjectList(projectList.filter((p) => p.id !== id));
      }
    });
  };

  const handleMoveProject = (from: number, to: number) => {
    if (to < 0 || to >= projectList.length) return;
    const reordered = [...projectList];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setProjectList(reordered);
    startTransition(async () => {
      await reorderProjectsAction(reordered.map((p) => p.id));
    });
  };

  const handleTogglePublish = (id: number, current: boolean) => {
    const next = !current;
    setProjectList(
      projectList.map((p) => (p.id === id ? { ...p, published: next } : p))
    );
    startTransition(async () => {
      await togglePublishProjectAction(id, next);
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          {(["all", "web", "mobile", "systems", "open_source"] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono uppercase border transition-colors cursor-pointer",
                  categoryFilter === cat
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.replace("_", " ")}
              </button>
            )
          )}
        </div>

        <HexButton
          type="button"
          variant="default"
          size="default"
          onClick={handleOpenCreate}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5 inline" />
          Add Project
        </HexButton>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center border border-border bg-surface space-y-2">
          <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-mono text-xs uppercase text-muted-foreground">
            No projects found in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map((p, idx) => (
            <SortableListItem
              key={p.id}
              id={p.id}
              index={idx}
              total={filteredProjects.length}
              isPublished={p.published}
              onMoveUp={() => handleMoveProject(idx, idx - 1)}
              onMoveDown={() => handleMoveProject(idx, idx + 1)}
              onTogglePublished={() => handleTogglePublish(p.id, p.published)}
              onEdit={() => handleOpenEdit(p)}
              onDelete={() => handleDeleteProject(p.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Tile Size Badge */}
                <span className="font-mono text-xs font-black px-2 py-0.5 border border-border bg-background text-primary">
                  {p.tileSize}
                </span>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {p.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({p.year})
                    </span>
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase text-primary border border-primary/30 px-1 py-0.2 bg-primary/10">
                        <Star className="h-2.5 w-2.5" /> Featured
                      </span>
                    )}
                    {p.confidential && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase text-warning border border-warning/30 px-1 py-0.2 bg-warning/10">
                        <Lock className="h-2.5 w-2.5" /> Confidential
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {p.summary}
                  </p>
                </div>
              </div>
            </SortableListItem>
          ))}
        </div>
      )}

      {/* Project Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Project" : "New Code Project"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProject} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Project Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({
                          ...formData,
                          title,
                          slug: editingId ? formData.slug : handleSlugify(title),
                        });
                      }}
                      placeholder="The Hive Portfolio"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      URL Slug
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="the-hive-portfolio"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Short Summary (Elevator Pitch)
                  </label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    rows={2}
                    placeholder="Hexagon-native full-stack portfolio engine..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Role
                    </label>
                    <Input
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      placeholder="Full-Stack Dev"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Year
                    </label>
                    <Input
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="2026"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ProjectInput["category"],
                        })
                      }
                    >
                      <option value="web">Web</option>
                      <option value="mobile">Mobile</option>
                      <option value="systems">Systems</option>
                      <option value="open_source">Open Source</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Tile Size
                    </label>
                    <Select
                      value={formData.tileSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tileSize: e.target.value as ProjectInput["tileSize"],
                        })
                      }
                    >
                      <option value="S">S (Small)</option>
                      <option value="M">M (Standard)</option>
                      <option value="L">L (Hero / 2x)</option>
                      <option value="XL">XL (Feature / 3x)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Client / Org (Optional)
                    </label>
                    <Input
                      value={formData.client || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, client: e.target.value })
                      }
                      placeholder="Personal or Client Name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as ProjectInput["status"],
                        })
                      }
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="archived">Archived</option>
                    </Select>
                  </div>
                </div>

                {/* Toggles: Featured & Confidential */}
                <div className="grid grid-cols-2 gap-4 border border-border p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono uppercase text-foreground">
                        Featured on Wall
                      </span>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Packs prominently in honeycomb
                      </p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, featured: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono uppercase text-warning">
                        Confidential
                      </span>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Blurred artwork & lock badge
                      </p>
                    </div>
                    <Switch
                      checked={formData.confidential}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, confidential: checked })
                      }
                    />
                  </div>
                </div>

                {/* Cover & Video Media Inputs */}
                <div className="space-y-3 border border-border p-3 bg-surface">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Media Assets
                  </span>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      Cover Media URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.coverMedia.url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coverMedia: {
                              ...formData.coverMedia,
                              url: e.target.value,
                              publicId: e.target.value,
                            },
                          })
                        }
                        placeholder="Image URL..."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMediaPickerField("cover")}
                        className="px-2.5 py-1 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
                        title="Pick cover from library"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      Preview Video URL (Optional)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.previewVideo?.url || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            previewVideo: e.target.value
                              ? {
                                  publicId: e.target.value,
                                  url: e.target.value,
                                  width: 1920,
                                  height: 1080,
                                }
                              : null,
                          })
                        }
                        placeholder="Video clip URL..."
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMediaPickerField("video")}
                        className="px-2.5 py-1 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
                        title="Pick video from library"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Live URL (Optional)
                    </label>
                    <Input
                      value={formData.liveUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, liveUrl: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Repository URL (Optional)
                    </label>
                    <Input
                      value={formData.repoUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, repoUrl: e.target.value })
                      }
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                {/* Rich Text Blocks: Problem, Approach, Result */}
                <div className="space-y-3 border-t border-border pt-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Case Study Blocks
                  </span>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      01. Problem
                    </label>
                    <Textarea
                      value={formData.problem}
                      onChange={(e) =>
                        setFormData({ ...formData, problem: e.target.value })
                      }
                      rows={3}
                      placeholder="The challenge, performance bottleneck, or architecture problem..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      02. Approach
                    </label>
                    <Textarea
                      value={formData.approach}
                      onChange={(e) =>
                        setFormData({ ...formData, approach: e.target.value })
                      }
                      rows={3}
                      placeholder="How you architected the solution and technical decisions..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      03. Result
                    </label>
                    <Textarea
                      value={formData.result}
                      onChange={(e) =>
                        setFormData({ ...formData, result: e.target.value })
                      }
                      rows={3}
                      placeholder="Outcomes, metrics, and deliverable impact..."
                      required
                    />
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div className="space-y-2 border-t border-border pt-3">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Technologies / Stack (Press Enter)
                  </label>
                  <div className="flex flex-wrap gap-1.5 border border-border p-2 bg-background min-h-[42px] items-center">
                    {formData.stack.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-surface border border-border text-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-danger cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={
                        formData.stack.length === 0 ? "Type and Enter..." : ""
                      }
                      className="flex-1 min-w-[120px] bg-transparent text-xs font-mono outline-none px-1"
                    />
                  </div>
                </div>

                {/* Metrics Builder */}
                <div className="space-y-2 border-t border-border pt-3">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Key Performance Metrics
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={metricLabel}
                      onChange={(e) => setMetricLabel(e.target.value)}
                      placeholder="Value (e.g. +40% or 10k)"
                      className="text-xs"
                    />
                    <Input
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value)}
                      placeholder="Label (e.g. Speed or Users)"
                      className="text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddMetric}
                      className="px-3 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {formData.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.metrics.map((m, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono border border-border bg-background"
                        >
                          <strong className="text-primary">{m.label}</strong>{" "}
                          <span className="text-muted-foreground">{m.value}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMetric(i)}
                            className="hover:text-danger"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Hex Tile Preview & Submit */}
              <div className="space-y-6 flex flex-col items-center">
                <div className="sticky top-4 w-full flex flex-col items-center space-y-6">
                  <HexTilePreview
                    title={formData.title}
                    category={formData.category}
                    tileSize={formData.tileSize}
                    coverUrl={formData.coverMedia.url}
                    previewVideoUrl={formData.previewVideo?.url}
                    confidential={formData.confidential}
                  />

                  <div className="w-full flex items-center justify-end gap-2 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <HexButton
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <Save className="h-3.5 w-3.5 inline mr-1" />
                      )}
                      {editingId ? "Update Project" : "Create Project"}
                    </HexButton>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Picker Modal */}
      {activeMediaPickerField && (
        <MediaPicker
          assets={mediaAssets}
          onSelect={(selected) => {
            if (selected.length > 0) {
              const item = selected[0];
              if (activeMediaPickerField === "cover") {
                setFormData({
                  ...formData,
                  coverMedia: {
                    publicId: item.publicId,
                    url: resolveMediaUrl(item.publicId, {
                      width: item.width || 1200,
                      height: item.height || 800,
                    }),
                    width: item.width,
                    height: item.height,
                    format: item.format,
                    dominantColor: item.dominantColor,
                  },
                });
              } else if (activeMediaPickerField === "video") {
                setFormData({
                  ...formData,
                  previewVideo: {
                    publicId: item.publicId,
                    url: resolveMediaUrl(item.publicId, { type: "video" }),
                    width: item.width,
                    height: item.height,
                  },
                });
              }
            }
          }}
          onClose={() => setActiveMediaPickerField(null)}
        />
      )}
    </div>
  );
}
