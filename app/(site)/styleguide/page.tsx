"use client";

import * as React from "react";
import { BrandHexOutline } from "@/components/hex/brand-hex-outline";
import { BrandHexSlashed } from "@/components/hex/brand-hex-slashed";
import { BrandHexSolid } from "@/components/hex/brand-hex-solid";
import { BrandHexTriple } from "@/components/hex/brand-hex-triple";
import { BrandLogoLockup } from "@/components/hex/brand-logo-lockup";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { ChamferFrame } from "@/components/hex/chamfer-frame";
import { Hex } from "@/components/hex/hex";
import { HexButton } from "@/components/hex/hex-button";
import { HexChip } from "@/components/hex/hex-chip";
import { HexGrid } from "@/components/hex/hex-grid";
import { SkeletonHex } from "@/components/hex/skeleton-hex";
import { ThemeToggle } from "@/components/hex/theme-toggle";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

export default function StyleguidePage() {
  const [switchChecked, setSwitchChecked] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 space-y-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Design System & Primitives
          </span>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            Styleguide
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase text-muted-foreground">
            Theme:
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* 1. Brand Elements */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">
            01 / Brand Elements & Logos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Logo Lockup & Monogram
            </h3>
            <div className="space-y-4">
              <BrandLogoLockup markSize={40} />
              <div className="flex items-center gap-4 pt-2">
                <BrandLogoMark size={32} className="text-foreground" />
                <BrandLogoMark size={40} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Hex Brand SVGs (currentColor)
            </h3>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex flex-col items-center gap-2">
                <BrandHexSolid size={32} className="text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">Solid</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BrandHexOutline size={32} className="text-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground">Outline</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BrandHexSlashed size={32} className="text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">Slashed</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BrandHexTriple size={36} className="text-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground">Triple</span>
              </div>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Typography Spec
            </h3>
            <div className="space-y-2">
              <div className="font-sans font-black text-xl">Montserrat Display 900</div>
              <div className="font-sans font-bold text-base">Headings 700 / 800</div>
              <div className="font-sans font-medium text-sm text-muted-foreground">
                Body 500: Geometric, sharp, and confident.
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                LABELS: 0.3EM TRACKING
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hex Primitives */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">
            02 / Hexagon Primitives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Hex Containers
            </h3>
            <div className="flex items-center gap-4 pt-2">
              <Hex height={80} fill="surface">
                <span className="font-mono text-xs">Surface</span>
              </Hex>
              <Hex height={80} fill="primary">
                <span className="font-mono text-xs">Primary</span>
              </Hex>
              <Hex height={80} fill="invert">
                <span className="font-mono text-xs">Invert</span>
              </Hex>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Chamfer Frame (60-Degree Cuts)
            </h3>
            <div className="space-y-3">
              <ChamferFrame corners="tr-bl" cutSize={16} className="p-4 w-full">
                <p className="text-xs text-foreground font-medium">
                  Framed rectangular preview without hex cropping.
                </p>
                <span className="font-mono text-[10px] text-muted-foreground">
                  60deg opposite cut
                </span>
              </ChamferFrame>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Hex Buttons & Chips
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <HexButton variant="default" size="default">
                Hex Capped
              </HexButton>
              <HexButton variant="secondary" size="default">
                Outline
              </HexButton>
              <div className="flex gap-2 w-full pt-2">
                <HexChip variant="default">Tag Chip</HexChip>
                <HexChip variant="active">Active</HexChip>
                <HexChip variant="muted">Muted</HexChip>
              </div>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Skeleton Hex Loaders
            </h3>
            <div className="flex items-center gap-4 pt-2">
              <SkeletonHex height={60} />
              <SkeletonHex height={80} />
              <SkeletonHex height={60} />
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-4 md:col-span-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Decorative Hex Grid
            </h3>
            <HexGrid rows={2} cols={5} cellSize={32} interactive className="h-32 border border-border bg-background" />
          </div>
        </div>
      </section>

      {/* 3. Restyled shadcn/ui Primitives */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">
            03 / Restyled shadcn Primitives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Buttons */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Buttons (Radius 0)
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Inputs (Chamfered Corner)
            </h3>
            <div className="space-y-3">
              <Input placeholder="Single chamfered input..." />
              <Select defaultValue="option-1">
                <option value="option-1">Option 1: Pointy-top</option>
                <option value="option-2">Option 2: Honeycomb</option>
              </Select>
            </div>
          </div>

          {/* Textarea */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Textarea (Chamfered)
            </h3>
            <Textarea placeholder="Chamfered corner textarea..." rows={3} />
          </div>

          {/* Badges */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Available</Badge>
              <Badge variant="warning">Limited</Badge>
              <Badge variant="destructive">Booked</Badge>
            </div>
          </div>

          {/* Switch & Tooltip */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Switch (Hex Thumb) & Tooltip
            </h3>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
                <span className="font-mono text-xs uppercase">
                  {switchChecked ? "Active" : "Inactive"}
                </span>
              </div>
              <Tooltip content="Hex system tooltip">
                <Button variant="outline" size="sm">
                  Hover for Tooltip
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Dialog & Sheet Triggers */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Dialog & Sheet
            </h3>
            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chamfered Modal</DialogTitle>
                    <DialogDescription>
                      This dialog uses a 60-degree cut corner and a hex-shaped close button.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-foreground">
                    All dialogs conform to radius 0 and the hive visual system.
                  </p>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="default">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger>
                  Open Sheet
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Slide-over Sheet</SheetTitle>
                  </SheetHeader>
                  <p className="text-sm text-muted-foreground mt-4">
                    Full-height drawer panel with sharp edges and hex close toggle.
                  </p>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Tabs */}
          <div className="border border-border bg-surface p-6 space-y-4 md:col-span-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Tabs (Hex Chip Triggers)
            </h3>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Specifications</TabsTrigger>
                <TabsTrigger value="tab3">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p className="text-sm text-muted-foreground border border-border p-4 bg-background">
                  Overview tab content rendered with hex-chip active triggers.
                </p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="text-sm text-muted-foreground border border-border p-4 bg-background">
                  Specifications content loaded on demand.
                </p>
              </TabsContent>
              <TabsContent value="tab3">
                <p className="text-sm text-muted-foreground border border-border p-4 bg-background">
                  Activity log and event history.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Skeletons */}
          <div className="border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Skeleton Primitive
            </h3>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </div>

          {/* Toast */}
          <div className="border border-border bg-surface p-6 space-y-4 md:col-span-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Toast Notifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Toast title="System Notice" description="Tokens loaded successfully." variant="default" />
              <Toast title="Success" description="Changes persisted to database." variant="success" />
              <Toast title="Warning" description="Storage threshold near 80%." variant="warning" />
              <Toast title="Alert" description="Authentication required." variant="destructive" />
            </div>
          </div>

          {/* Table */}
          <div className="border border-border bg-surface p-6 space-y-4 md:col-span-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Data Table
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Geometry</TableHead>
                  <TableHead>Angle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold">Pointy-top Hex</TableCell>
                  <TableCell className="font-mono text-xs">polygon(50% 0...)</TableCell>
                  <TableCell className="font-mono text-xs">60°</TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Chamfer Frame</TableCell>
                  <TableCell className="font-mono text-xs">Opposite 60° cut</TableCell>
                  <TableCell className="font-mono text-xs">60°</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Ready</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Command Palette */}
          <div className="border border-border bg-surface p-6 space-y-4 md:col-span-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Command Palette Component
            </h3>
            <div className="max-w-md mx-auto">
              <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandGroup heading="Rooms">
                    <CommandItem>Work (The Honeycomb Wall)</CommandItem>
                    <CommandItem>Studio (The Wall)</CommandItem>
                    <CommandItem>Journal (Articles)</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
