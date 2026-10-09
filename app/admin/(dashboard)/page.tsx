import Link from "next/link";
import {
  BookOpen,
  Clock,
  FolderKanban,
  Mail,
  Palette,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import {
  articles,
  auditLog,
  messages,
  projects,
  studioItems,
} from "@/lib/db/schema";
import { count, desc } from "drizzle-orm";

export default async function AdminDashboardPage() {
  let stats = {
    messages: 0,
    projects: 0,
    studio: 0,
    articles: 0,
  };

  let recentLogs: Array<{
    id: number;
    action: string;
    entityType: string;
    createdAt: Date;
  }> = [];

  try {
    const [msgRes] = await db.select({ val: count() }).from(messages);
    const [projRes] = await db.select({ val: count() }).from(projects);
    const [studioRes] = await db.select({ val: count() }).from(studioItems);
    const [artRes] = await db.select({ val: count() }).from(articles);

    stats = {
      messages: msgRes?.val ?? 0,
      projects: projRes?.val ?? 0,
      studio: studioRes?.val ?? 0,
      articles: artRes?.val ?? 0,
    };

    recentLogs = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(5);
  } catch {
    // Database connection pending setup; defaults to zero counts
  }

  const statCards = [
    { label: "Unread Messages", value: stats.messages, href: "/admin/messages", icon: Mail },
    { label: "Code Projects", value: stats.projects, href: "/admin/projects", icon: FolderKanban },
    { label: "Studio Assets", value: stats.studio, href: "/admin/studio", icon: Palette },
    { label: "Articles", value: stats.articles, href: "/admin/journal", icon: BookOpen },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border bg-surface p-6">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Security & Controls Active
          </span>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            The Hive Command Center
          </h2>
          <p className="text-sm text-muted-foreground">
            All content updates propagate to the public site through cache tags.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects">
            <HexButton variant="default" size="default">
              <Plus className="mr-1.5 h-3.5 w-3.5 inline" />
              New Project
            </HexButton>
          </Link>
          <Link href="/admin/journal">
            <Button variant="outline">
              <Plus className="mr-1.5 h-3.5 w-3.5 inline" />
              Write Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="border border-border bg-surface p-5 hover:border-primary transition-colors space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-black tracking-tight text-foreground">
                {card.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="border border-border bg-surface p-6 space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              href="/admin/studio"
              className="flex items-center justify-between p-3 border border-border bg-background hover:border-primary transition-colors text-xs font-mono uppercase"
            >
              <span>Upload Studio Artwork</span>
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/now"
              className="flex items-center justify-between p-3 border border-border bg-background hover:border-primary transition-colors text-xs font-mono uppercase"
            >
              <span>Update Now / Build Log</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 border border-border bg-background hover:border-primary transition-colors text-xs font-mono uppercase"
            >
              <span>Edit Site Settings & SEO</span>
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="border border-border bg-surface p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Recent Security Audit Events
            </h3>
            <Badge variant="secondary">Live Log</Badge>
          </div>

          {recentLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-bold">
                      {log.action}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.entityType}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="border border-border p-8 text-center bg-background space-y-2">
              <ShieldCheck className="h-6 w-6 text-primary mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No recent security incidents. Audit trail active.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
