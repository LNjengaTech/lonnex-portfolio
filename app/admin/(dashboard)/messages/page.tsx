import { requireAuth } from "@/lib/auth";
import { getContactMethodsList, getMessagesList } from "@/lib/db/queries/contact";
import { MessagesClient } from "./messages-client";
import type { ContactMethodInput } from "@/lib/validators/contact";

export default async function AdminMessagesPage() {
  await requireAuth();

  const messagesList = await getMessagesList();
  const contactMethodsList = await getContactMethodsList(true);

  const formattedContactMethods: Array<ContactMethodInput & { id: number }> =
    contactMethodsList.map((c) => ({
      id: c.id,
      type: c.type as ContactMethodInput["type"],
      label: c.label,
      value: c.value,
      icon: c.icon,
      order: c.order,
      visible: c.visible,
    }));

  const formattedMessages = messagesList.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    content: m.content,
    briefDetails: m.briefDetails as Record<string, unknown> | null,
    status: m.status,
    ipAddress: m.ipAddress,
    createdAt: m.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Messages & Contact Channels
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage client brief inquiries, submissions inbox, and public contact links.
        </p>
      </div>

      <MessagesClient
        initialMessages={formattedMessages}
        initialContactMethods={formattedContactMethods}
      />
    </div>
  );
}
