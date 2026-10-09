import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";

export async function getProfile() {
  try {
    const records = await db
      .select()
      .from(profile)
      .where(eq(profile.id, "singleton"))
      .limit(1);

    if (records.length > 0) {
      return records[0];
    }
  } catch (error) {
    console.error("[getProfile Error]:", error);
  }

  // Fallback defaults
  return {
    id: "singleton",
    name: "Lonnex Njenga",
    shortBio:
      "Web and mobile developer and graphic designer with an architectural approach to code and visual identity.",
    longBio:
      "Specialising in TypeScript, Next.js, Flutter, and commercial brand collateral from high-impact banners to complete digital identities.",
    photoUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    photoCrops: { zoom: 1, offsetX: 0, offsetY: 0 },
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi (EAT, UTC+3)",
    updatedAt: new Date(),
  };
}
