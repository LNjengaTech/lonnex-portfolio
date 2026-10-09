"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  Settings,
  User,
  X,
} from "lucide-react";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

export interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
  };
  onLogout: () => Promise<void>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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

export function AdminSidebar({
  user,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Close mobile sidebar on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMobileOpen) {
        onCloseMobile?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Lock body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const renderNavLinks = (isDrawer = false) => (
    <nav className="p-3 space-y-1 overflow-y-auto flex-1">
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
            onClick={() => {
              if (isDrawer) onCloseMobile?.();
            }}
            title={isCollapsed && !isDrawer ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors group relative",
              isActive
                ? "bg-background text-foreground font-bold border-l-2 border-primary"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              isCollapsed && !isDrawer ? "justify-center px-0" : ""
            )}
          >
            {/* Hex Icon Container */}
            <div
              className={cn(
                "flex h-7 w-6 items-center justify-center transition-colors flex-shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground border border-border group-hover:border-primary/50 group-hover:text-foreground"
              )}
              style={{ clipPath: HEX_CLIP_PATH }}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Label (shown when not collapsed or in mobile drawer) */}
            {(!isCollapsed || isDrawer) && (
              <span className="truncate">{item.label}</span>
            )}

            {/* Collapsed hover tooltip */}
            {isCollapsed && !isDrawer && (
              <div className="absolute left-full ml-2 z-50 hidden group-hover:block px-2.5 py-1 bg-surface border border-border text-foreground font-mono text-[10px] uppercase shadow-lg whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── MOBILE OVERLAY DRAWER ────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-surface border-r border-border shadow-2xl flex flex-col justify-between h-full animate-in slide-in-from-left duration-200">
            <div className="flex flex-col flex-1 min-h-0">
              {/* Brand Header with Close button */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <BrandLogoMark size={28} className="text-primary flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-sm uppercase tracking-tight text-foreground truncate">
                      The Hive Admin
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Control Suite
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="flex h-8 w-7 items-center justify-center bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer flex-shrink-0 ml-2"
                  style={{ clipPath: HEX_CLIP_PATH }}
                  aria-label="Close menu"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Navigation Items */}
              {renderNavLinks(true)}
            </div>

            {/* User Footer & Logout */}
            <div className="p-4 border-t border-border bg-background/50 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-7 items-center justify-center bg-primary text-primary-foreground font-mono text-xs font-bold flex-shrink-0"
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
        </div>
      )}

      {/* ── DESKTOP SIDEBAR (In-Flow, Collapsible) ─────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col justify-between h-screen sticky top-0 border-r border-border bg-surface flex-shrink-0 transition-all duration-200 z-20",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div
            className={cn(
              "flex items-center p-4 border-b border-border transition-all",
              isCollapsed ? "justify-center px-2" : "justify-between"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <BrandLogoMark size={28} className="text-primary flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm uppercase tracking-tight text-foreground truncate">
                    The Hive Admin
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Control Suite
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            {!isCollapsed && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer flex-shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          {renderNavLinks(false)}
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-border bg-background/50 space-y-2">
          {/* Collapse expander button when collapsed */}
          {isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-1.5 border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* User badge */}
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div
              className="flex h-8 w-7 items-center justify-center bg-primary text-primary-foreground font-mono text-xs font-bold flex-shrink-0"
              style={{ clipPath: HEX_CLIP_PATH }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate">
                  {user.name}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>

          {/* Logout button */}
          <form action={onLogout}>
            <button
              type="submit"
              className={cn(
                "flex w-full items-center justify-center gap-2 border border-border bg-surface font-mono text-xs uppercase text-muted-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors cursor-pointer",
                isCollapsed ? "p-2" : "px-3 py-1.5"
              )}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
