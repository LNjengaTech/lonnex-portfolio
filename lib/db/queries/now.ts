import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { buildLogEntries, nowProject } from "@/lib/db/schema";

export async function getNowProject() {
  try {
    const projects = await db
      .select()
      .from(nowProject)
      .orderBy(desc(nowProject.id))
      .limit(1);

    if (projects.length > 0) {
      return projects[0];
    }
  } catch (error) {
    console.error("[getNowProject Error]:", error);
  }

  return {
    id: 1,
    title: "The Hive Portfolio Engine",
    description:
      "Constructing a custom hexagon-native portfolio with full CMS control and media pipeline.",
    progress: 75,
    stack: ["Next.js", "TypeScript", "Drizzle", "PostgreSQL", "Tailwind"],
    status: "in_progress",
    updatedAt: new Date(),
  };
}

export async function getBuildLogEntries(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db
        .select()
        .from(buildLogEntries)
        .orderBy(asc(buildLogEntries.order), desc(buildLogEntries.logDate));
    }

    return await db
      .select()
      .from(buildLogEntries)
      .where(eq(buildLogEntries.published, true))
      .orderBy(asc(buildLogEntries.order), desc(buildLogEntries.logDate));
  } catch (error) {
    console.error("[getBuildLogEntries Error]:", error);
    return [];
  }
}
