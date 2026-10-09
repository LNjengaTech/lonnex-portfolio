import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { getUploadSignature } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = [
  "portfolio/projects",
  "portfolio/studio",
  "portfolio/articles",
  "portfolio/profile",
  "portfolio/media",
] as const;

const signRequestSchema = z.object({
  folder: z.enum(ALLOWED_FOLDERS),
  resourceType: z.enum(["image", "video", "auto"]).default("image"),
});

export async function POST(request: NextRequest) {
  // Auth guard — must be a signed-in admin
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { folder } = parsed.data;

  const signatureData = await getUploadSignature(folder);

  return NextResponse.json(signatureData);
}
