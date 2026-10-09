import { requireAuth } from "@/lib/auth";
import {
  getStudioCategories,
  getStudioCollections,
  getStudioItems,
} from "@/lib/db/queries/studio";
import { getAllMediaAssets } from "@/lib/db/queries/media";
import { StudioClient } from "./studio-client";
import type {
  StudioItemInput,
  StudioCategoryInput,
  StudioCollectionInput,
} from "@/lib/validators/studio";

interface StudioItemRecord extends StudioItemInput {
  id: number;
}

interface StudioCategoryRecord extends StudioCategoryInput {
  id: number;
}

interface StudioCollectionRecord extends StudioCollectionInput {
  id: number;
}

export default async function AdminStudioPage() {
  await requireAuth();

  const items = await getStudioItems(true);
  const categories = await getStudioCategories(true);
  const collections = await getStudioCollections(true);
  const mediaAssets = await getAllMediaAssets();

  const formattedItems: StudioItemRecord[] = items.map((i) => ({
    id: i.id,
    title: i.title,
    categoryId: i.categoryId,
    collectionId: i.collectionId,
    mediaType: i.mediaType as "image" | "video",
    mediaUrl: i.mediaUrl,
    cloudinaryId: i.cloudinaryId,
    width: i.width,
    height: i.height,
    ratio: i.ratio,
    specLabel: i.specLabel,
    year: i.year,
    confidential: i.confidential,
    order: i.order,
    published: i.published,
  }));

  const formattedCategories: StudioCategoryRecord[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    order: c.order,
    published: c.published,
  }));

  const formattedCollections: StudioCollectionRecord[] = collections.map(
    (col) => ({
      id: col.id,
      title: col.title,
      slug: col.slug,
      description: col.description,
      order: col.order,
      published: col.published,
    })
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Studio Artwork (The Wall)
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage commercial graphic designs, roll-up banners, fliers, video ads, aspect ratios, and bulk asset imports.
        </p>
      </div>

      <StudioClient
        initialItems={formattedItems}
        initialCategories={formattedCategories}
        initialCollections={formattedCollections}
        mediaAssets={mediaAssets}
      />
    </div>
  );
}
