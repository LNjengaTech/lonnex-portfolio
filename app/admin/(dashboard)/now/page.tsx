import { requireAuth } from "@/lib/auth";
import { getAvailability } from "@/lib/db/queries/availability";
import { getNowProject, getBuildLogEntries } from "@/lib/db/queries/now";
import { NowClient } from "./now-client";
import type { AvailabilityInput } from "@/lib/validators/availability";

export default async function AdminNowPage() {
  await requireAuth();

  const availabilityData = await getAvailability();
  const projectData = await getNowProject();
  const logsData = await getBuildLogEntries(true);

  const formattedAvailability: AvailabilityInput = {
    status: availabilityData.status as "available" | "booked" | "limited",
    message: availabilityData.message,
    nextAvailableDate: availabilityData.nextAvailableDate,
  };

  const formattedProject = {
    id: projectData.id,
    title: projectData.title,
    description: projectData.description,
    progress: projectData.progress,
    stack: Array.isArray(projectData.stack) ? (projectData.stack as string[]) : [],
    status: projectData.status,
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Now & Availability Hub
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your live work beacon, active build project, and real-time build log entries.
        </p>
      </div>

      <NowClient
        initialAvailability={formattedAvailability}
        initialProject={formattedProject}
        initialLogs={logsData}
      />
    </div>
  );
}
