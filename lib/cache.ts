/**
 * Cache revalidation helpers.
 * Wraps next/cache revalidateTag to maintain a stable 1-arg call signature
 * across Next.js versions that add a required `profile` second argument.
 */
import {
  revalidateTag as _revalidateTag,
  revalidatePath as _revalidatePath,
} from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const revalidateTag = (tag: string) => (_revalidateTag as any)(tag);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const revalidatePath = (path: string, type?: "page" | "layout") =>
  (_revalidatePath as any)(path, type);
