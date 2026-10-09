"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  Settings,
  User,
} from "lucide-react";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
  };
  onLogout: () => Promise<void>;
}

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Studio", href: "/admin/studio", icon: Palette },
  { label: "Journal", href: "/admin/journal", icon: BookOpen },
  { label: "Now", href: "/admin/now", icon: Clock },
  { label: "About & Skills", href: "/admin/about", icon: User },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-surface flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <BrandLogoMark size={28} className="text-primary flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm uppercase tracking-tight text-foreground">
              The Hive Admin
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Control Suite
            </span>
          </div>
        </div>

        {/* Navigation Items with Hex Icons */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-background text-foreground font-bold border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                {/* Hex Icon Container */}
                <div
                  className={cn(
                    "flex h-7 w-6 items-center justify-center transition-colors flex-shrink-0",
                    isActive ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border border-border"
                  )}
                  style={{ clipPath: HEX_CLIP_PATH }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-border bg-background/50 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-7 items-center justify-center bg-primary text-primary-foreground font-mono text-xs font-bold"
            style={{ clipPath: HEX_CLIP_PATH }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">
              {user.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </div>

        <form action={onLogout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 border border-border bg-surface px-3 py-2 font-mono text-xs uppercase text-muted-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
