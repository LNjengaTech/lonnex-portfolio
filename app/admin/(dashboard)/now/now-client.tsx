"use client";

import * as React from "react";
import {
  Check,
  Clock,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SortableListItem } from "@/components/admin/sortable-list-item";
import {
  updateAvailabilityAction,
  updateNowProjectAction,
  createBuildLogEntryAction,
  updateBuildLogEntryAction,
  deleteBuildLogEntryAction,
  reorderBuildLogEntriesAction,
  togglePublishBuildLogEntryAction,
} from "./actions";
import type { AvailabilityInput } from "@/lib/validators/availability";
import type { NowProjectInput, BuildLogEntryInput } from "@/lib/validators/now";
import { cn } from "@/lib/utils";

interface NowProjectRecord {
  id: number;
  title: string;
  description: string;
  progress: number;
  stack: string[];
  status: string;
}

interface BuildLogRecord {
  id: number;
  projectId: number | null;
  title: string;
  content: string;
  logDate: Date;
  order: number;
  published: boolean;
}

interface NowClientProps {
  initialAvailability: AvailabilityInput;
  initialProject: NowProjectRecord;
  initialLogs: BuildLogRecord[];
}

export function NowClient({
  initialAvailability,
  initialProject,
  initialLogs,
}: NowClientProps) {
  // 1. Availability State
  const [avail, setAvail] = React.useState<AvailabilityInput>(initialAvailability);
  const [availPending, startAvailTransition] = React.useTransition();
  const [availSuccess, setAvailSuccess] = React.useState(false);

  // 2. Project State
  const [project, setProject] = React.useState<NowProjectRecord>(initialProject);
  const [tagInput, setTagInput] = React.useState("");
  const [projectPending, startProjectTransition] = React.useTransition();
  const [projectSuccess, setProjectSuccess] = React.useState(false);

  // 3. Build Log State
  const [logs, setLogs] = React.useState<BuildLogRecord[]>(initialLogs);
  const [logDialogOpen, setLogDialogOpen] = React.useState(false);
  const [editingLogId, setEditingLogId] = React.useState<number | null>(null);
  const [logFormData, setLogFormData] = React.useState<BuildLogEntryInput>({
    title: "",
    content: "",
    logDate: new Date(),
    order: 0,
    published: true,
  });
  const [logPending, startLogTransition] = React.useTransition();
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // Handlers: Availability
  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    startAvailTransition(async () => {
      const res = await updateAvailabilityAction(avail);
      if (res.success) {
        setAvailSuccess(true);
        setTimeout(() => setAvailSuccess(false), 3000);
      }
    });
  };

  // Handlers: Project
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !project.stack.includes(val)) {
        setProject({ ...project, stack: [...project.stack, val] });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProject({
      ...project,
      stack: project.stack.filter((t) => t !== tag),
    });
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    startProjectTransition(async () => {
      const res = await updateNowProjectAction(project.id, {
        title: project.title,
        description: project.description,
        progress: project.progress,
        stack: project.stack,
        status: project.status as "in_progress" | "completed" | "paused",
      });
      if (res.success) {
        setProjectSuccess(true);
        setTimeout(() => setProjectSuccess(false), 3000);
      }
    });
  };

  // Handlers: Build Log
  const handleOpenCreateLog = () => {
    setEditingLogId(null);
    setLogFormData({
      title: "",
      content: "",
      logDate: new Date(),
      order: logs.length + 1,
      published: true,
    });
    setLogDialogOpen(true);
  };

  const handleOpenEditLog = (log: BuildLogRecord) => {
    setEditingLogId(log.id);
    setLogFormData({
      title: log.title,
      content: log.content,
      logDate: new Date(log.logDate),
      order: log.order,
      published: log.published,
    });
    setLogDialogOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    startLogTransition(async () => {
      if (editingLogId) {
        const res = await updateBuildLogEntryAction(editingLogId, logFormData);
        if (res.success) {
          setLogs(
            logs.map((l) =>
              l.id === editingLogId ? { ...l, ...logFormData } : l
            )
          );
          setLogDialogOpen(false);
        }
      } else {
        const res = await createBuildLogEntryAction({
          ...logFormData,
          projectId: project.id,
        });
        if (res.success && res.entry) {
          setLogs([...logs, res.entry as BuildLogRecord]);
          setLogDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteLog = (id: number) => {
    startLogTransition(async () => {
      const res = await deleteBuildLogEntryAction(id);
      if (res.success) {
        setLogs(logs.filter((l) => l.id !== id));
      }
    });
  };

  const handleTogglePublishLog = (id: number, current: boolean) => {
    const next = !current;
    setLogs(logs.map((l) => (l.id === id ? { ...l, published: next } : l)));
    startLogTransition(async () => {
      await togglePublishBuildLogEntryAction(id, next);
    });
  };

  const handleMoveLog = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= logs.length) return;
    const reordered = [...logs];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setLogs(reordered);
    const ids = reordered.map((l) => l.id);
    startLogTransition(async () => {
      await reorderBuildLogEntriesAction(ids);
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* SECTION 1: Availability Status Beacon */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground">
              Availability Status Beacon
            </h3>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Signals work capacity across the public site and admin header
            </p>
          </div>
          {availSuccess && (
            <span className="font-mono text-xs uppercase text-success flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAvailability} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Status Level
              </label>
              <Select
                value={avail.status}
                onChange={(e) =>
                  setAvail({
                    ...avail,
                    status: e.target.value as "available" | "limited" | "booked",
                  })
                }
              >
                <option value="available">Available for Hire</option>
                <option value="limited">Limited Capacity</option>
                <option value="booked">Fully Booked</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Next Available Date / Timeframe
              </label>
              <Input
                value={avail.nextAvailableDate || ""}
                onChange={(e) =>
                  setAvail({ ...avail, nextAvailableDate: e.target.value })
                }
                placeholder="e.g. Immediate, Q2 2026, or 2 weeks"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Availability Statement / Note
            </label>
            <Textarea
              value={avail.message}
              onChange={(e) =>
                setAvail({ ...avail, message: e.target.value })
              }
              rows={2}
              placeholder="Open for select web development contracts and commercial brand commissions."
              required
            />
          </div>

          <div className="flex justify-end">
            <HexButton
              type="submit"
              variant="default"
              size="sm"
              disabled={availPending}
            >
              {availPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 inline mr-1" />
              )}
              Save Availability
            </HexButton>
          </div>
        </form>
      </div>

      {/* SECTION 2: Current Focus Project */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground">
              Current Focus Project
            </h3>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Featured work-in-progress displayed on the /now room
            </p>
          </div>
          {projectSuccess && (
            <span className="font-mono text-xs uppercase text-success flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Project Title
              </label>
              <Input
                value={project.title}
                onChange={(e) =>
                  setProject({ ...project, title: e.target.value })
                }
                placeholder="The Hive Portfolio Engine"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <Select
                value={project.status}
                onChange={(e) =>
                  setProject({ ...project, status: e.target.value })
                }
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <Textarea
              value={project.description}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
              rows={2}
              required
            />
          </div>

          {/* Progress Slider */}
          <div className="space-y-2 bg-background p-3 border border-border">
            <div className="flex items-center justify-between text-xs font-mono uppercase">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="text-foreground font-bold">{project.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress}
              onChange={(e) =>
                setProject({
                  ...project,
                  progress: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Technology Stack Tags */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Tech Stack (Type and press Enter)
            </label>
            <div className="flex flex-wrap gap-1.5 border border-border p-2 bg-background min-h-[42px] items-center">
              {project.stack.map((tag) => (
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
                  project.stack.length === 0 ? "e.g. Next.js, TypeScript..." : ""
                }
                className="flex-1 min-w-[120px] bg-transparent text-xs font-mono outline-none px-1"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <HexButton
              type="submit"
              variant="default"
              size="sm"
              disabled={projectPending}
            >
              {projectPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 inline mr-1" />
              )}
              Save Project Focus
            </HexButton>
          </div>
        </form>
      </div>

      {/* SECTION 3: Build Log Timeline */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground">
              Build Log Timeline Entries
            </h3>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Micro-updates and technical decisions posted in seconds
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleOpenCreateLog}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Log Entry</span>
          </Button>
        </div>

        {/* Logs List */}
        {logs.length === 0 ? (
          <div className="p-8 text-center border border-border bg-background space-y-2">
            <Clock className="h-6 w-6 text-muted-foreground mx-auto" />
            <p className="font-mono text-xs uppercase text-muted-foreground">
              No build log entries recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <SortableListItem
                key={log.id}
                id={log.id}
                index={idx}
                total={logs.length}
                isPublished={log.published}
                onMoveUp={() => handleMoveLog(idx, idx - 1)}
                onMoveDown={() => handleMoveLog(idx, idx + 1)}
                onTogglePublished={() =>
                  handleTogglePublishLog(log.id, log.published)
                }
                onEdit={() => handleOpenEditLog(log)}
                onDelete={() => handleDeleteLog(log.id)}
                draggable
                onDragStart={() => setDraggedIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedIndex !== null && draggedIndex !== idx) {
                    handleMoveLog(draggedIndex, idx);
                    setDraggedIndex(null);
                  }
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">
                      {log.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(log.logDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {log.content}
                  </p>
                </div>
              </SortableListItem>
            ))}
          </div>
        )}
      </div>

      {/* Build Log Create / Edit Modal */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLogId ? "Edit Build Log Entry" : "New Build Log Entry"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLog} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Entry Title
              </label>
              <Input
                value={logFormData.title}
                onChange={(e) =>
                  setLogFormData({ ...logFormData, title: e.target.value })
                }
                placeholder="Hex coordinate layout packer engineered"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Log Content / Technical Notes
              </label>
              <Textarea
                value={logFormData.content}
                onChange={(e) =>
                  setLogFormData({ ...logFormData, content: e.target.value })
                }
                rows={4}
                placeholder="Implemented axial coordinate conversions and non-overlapping packer..."
                required
              />
            </div>

            <div className="flex items-center justify-between border border-border p-3 bg-background">
              <span className="text-xs font-mono uppercase text-foreground">
                Publish on /now timeline
              </span>
              <input
                type="checkbox"
                checked={logFormData.published}
                onChange={(e) =>
                  setLogFormData({
                    ...logFormData,
                    published: e.target.checked,
                  })
                }
                className="accent-primary cursor-pointer h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogDialogOpen(false)}
              >
                Cancel
              </Button>
              <HexButton
                type="submit"
                variant="default"
                size="sm"
                disabled={logPending}
              >
                {logPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 inline mr-1" />
                )}
                {editingLogId ? "Update Entry" : "Create Entry"}
              </HexButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
