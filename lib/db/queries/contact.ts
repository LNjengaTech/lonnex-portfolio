import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMethods, messages } from "@/lib/db/schema";

export async function getContactMethodsList(includeHidden = true) {
  try {
    if (includeHidden) {
      return await db
        .select()
        .from(contactMethods)
        .orderBy(asc(contactMethods.order), asc(contactMethods.id));
    }

    return await db
      .select()
      .from(contactMethods)
      .where(eq(contactMethods.visible, true))
      .orderBy(asc(contactMethods.order), asc(contactMethods.id));
  } catch (error) {
    console.error("[getContactMethodsList Error]:", error);
    return [];
  }
}

export async function getMessagesList() {
  try {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  } catch (error) {
    console.error("[getMessagesList Error]:", error);
    return [];
  }
}

export async function getMessageById(id: number) {
  try {
    const list = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    return list[0] || null;
  } catch (error) {
    console.error("[getMessageById Error]:", error);
    return null;
  }
}
