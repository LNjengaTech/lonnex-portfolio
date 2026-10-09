import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";

const saveAssetSchema = z.object({
  publicId: z.string().min(1),
  type: z.enum(["image", "video"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().min(1),
  bytes: z.number().int().positive(),
  dominantColor: z.string().optional(),
  altText: z.string().default(""),
  folder: z.string().default("portfolio/media"),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
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

  const parsed = saveAssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    // Check if asset already exists (idempotent)
    const existing = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.publicId, data.publicId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ id: existing[0].id, created: false });
    }

    const [asset] = await db
      .insert(mediaAssets)
      .values({
        publicId: data.publicId,
        type: data.type,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        dominantColor: data.dominantColor ?? null,
        altText: data.altText,
        folder: data.folder,
        tags: data.tags ?? [],
      })
      .returning();

    return NextResponse.json({ id: asset.id, created: true });
  } catch (error) {
    console.error("[Media Save Error]", error);
    return NextResponse.json(
      { error: "Failed to save media asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing asset id" }, { status: 400 });
  }

  // Find the asset
  const assets = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, parseInt(id, 10)))
    .limit(1);

  if (!assets.length) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const asset = assets[0];

  // Import and delete from Cloudinary
  const { deleteCloudinaryAsset } = await import("@/lib/cloudinary");
  const deleted = await deleteCloudinaryAsset(
    asset.publicId,
    asset.type as "image" | "video"
  );

  if (!deleted) {
    return NextResponse.json(
      { error: "Failed to delete from Cloudinary" },
      { status: 500 }
    );
  }

  // Delete from database
  await db.delete(mediaAssets).where(eq(mediaAssets.id, parseInt(id, 10)));

  return NextResponse.json({ success: true });
}
