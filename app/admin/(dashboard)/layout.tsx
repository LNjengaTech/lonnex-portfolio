import * as React from "react";
import { AdminShell } from "@/components/admin/admin-shell";
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
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
      }}
      onLogout={handleLogout}
      availabilityStatus={
        (availabilityData?.status as "available" | "limited" | "booked") ||
        "available"
      }
    >
      {children}
    </AdminShell>
  );
}
