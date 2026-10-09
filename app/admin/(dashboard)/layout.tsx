import * as React from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { logoutAdmin, requireAuth } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  async function handleLogout() {
    "use server";
    await logoutAdmin();
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar
        user={{
          name: user.name,
          email: user.email,
        }}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Dashboard" availabilityStatus="available" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
