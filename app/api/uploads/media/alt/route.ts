import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";

const patchSchema = z.object({
  id: z.number().int().positive(),
  altText: z.string(),
});

export async function PATCH(request: NextRequest) {
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await db
    .update(mediaAssets)
    .set({ altText: parsed.data.altText })
    .where(eq(mediaAssets.id, parsed.data.id));

  return NextResponse.json({ success: true });
}
