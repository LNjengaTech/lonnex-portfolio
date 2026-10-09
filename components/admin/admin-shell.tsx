"use client";

import * as React from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

interface AdminShellProps {
  user: {
    name: string;
    email: string;
  };
  onLogout: () => Promise<void>;
  availabilityStatus: "available" | "limited" | "booked";
  children: React.ReactNode;
}

export function AdminShell({
  user,
  onLogout,
  availabilityStatus,
  children,
}: AdminShellProps) {
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Desktop sidebar collapsed state (persisted to localStorage)
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Hydrate collapsed state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("hive_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors in private mode
    }
  }, []);

  const handleToggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("hive_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const handleToggleMobile = React.useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleCloseMobile = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar: handles both desktop (fixed in-flow, collapsable) and mobile (sliding drawer) */}
      <AdminSidebar
        user={user}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader
          title="Dashboard"
          availabilityStatus={availabilityStatus}
          onToggleMobile={handleToggleMobile}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
