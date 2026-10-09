import * as React from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { logoutAdmin, requireAuth } from "@/lib/auth";
import { getAvailability } from "@/lib/db/queries/availability";

// All admin routes are session-gated and must be server-rendered on demand.
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const availabilityData = await getAvailability();

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
        <AdminHeader
          title="Dashboard"
          availabilityStatus={
            (availabilityData?.status as "available" | "limited" | "booked") ||
            "available"
          }
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
