"use client";

import * as React from "react";
import {
  Archive,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Inbox,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SortableListItem } from "@/components/admin/sortable-list-item";
import {
  createContactMethodAction,
  updateContactMethodAction,
  deleteContactMethodAction,
  reorderContactMethodsAction,
  toggleVisibleContactMethodAction,
  updateMessageStatusAction,
  deleteMessageAction,
} from "./actions";
import type { ContactMethodInput } from "@/lib/validators/contact";
import { cn } from "@/lib/utils";

interface MessageRecord {
  id: number;
  name: string;
  email: string;
  subject: string;
  content: string;
  briefDetails: Record<string, unknown> | null;
  status: string;
  ipAddress: string | null;
  createdAt: Date;
}

interface MessagesClientProps {
  initialMessages: MessageRecord[];
  initialContactMethods: Array<ContactMethodInput & { id: number }>;
}

export function MessagesClient({
  initialMessages,
  initialContactMethods,
}: MessagesClientProps) {
  const [activeTab, setActiveTab] = React.useState("inbox");

  // ==========================================
  // 1. MESSAGES INBOX STATE
  // ==========================================
  const [msgList, setMsgList] = React.useState<MessageRecord[]>(initialMessages);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedMessage, setSelectedMessage] =
    React.useState<MessageRecord | null>(null);
  const [msgPending, startMsgTransition] = React.useTransition();

  const filteredMessages = msgList.filter((m) => {
    if (statusFilter === "all") return true;
    return m.status === statusFilter;
  });

  const unreadCount = msgList.filter((m) => m.status === "new").length;

  const handleUpdateStatus = (
    id: number,
    newStatus: "new" | "read" | "replied" | "archived"
  ) => {
    setMsgList(
      msgList.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    }
    startMsgTransition(async () => {
      await updateMessageStatusAction(id, newStatus);
    });
  };

  const handleDeleteMessage = (id: number) => {
    setMsgList(msgList.filter((m) => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
    startMsgTransition(async () => {
      await deleteMessageAction(id);
    });
  };

  // ==========================================
  // 2. CONTACT METHODS STATE
  // ==========================================
  const [contactList, setContactList] =
    React.useState<Array<ContactMethodInput & { id: number }>>(
      initialContactMethods
    );
  const [contactPending, startContactTransition] = React.useTransition();
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [editingContactId, setEditingContactId] = React.useState<number | null>(
    null
  );
  const [contactForm, setContactForm] = React.useState<ContactMethodInput>({
    type: "email",
    label: "",
    value: "",
    icon: "Mail",
    order: 0,
    visible: true,
  });

  const handleSaveContactMethod = (e: React.FormEvent) => {
    e.preventDefault();
    startContactTransition(async () => {
      if (editingContactId) {
        const res = await updateContactMethodAction(
          editingContactId,
          contactForm
        );
        if (res.success) {
          setContactList(
            contactList.map((c) =>
              c.id === editingContactId ? { ...c, ...contactForm } : c
            )
          );
          setContactDialogOpen(false);
        }
      } else {
        const res = await createContactMethodAction({
          ...contactForm,
          order: contactList.length + 1,
        });
        if (res.success && res.method) {
          setContactList([
            ...contactList,
            res.method as ContactMethodInput & { id: number },
          ]);
          setContactDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteContactMethod = (id: number) => {
    startContactTransition(async () => {
      const res = await deleteContactMethodAction(id);
      if (res.success) {
        setContactList(contactList.filter((c) => c.id !== id));
      }
    });
  };

  const handleMoveContactMethod = (from: number, to: number) => {
    if (to < 0 || to >= contactList.length) return;
    const reordered = [...contactList];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setContactList(reordered);
    startContactTransition(async () => {
      await reorderContactMethodsAction(reordered.map((c) => c.id));
    });
  };

  const handleToggleVisibleContact = (id: number, current: boolean) => {
    const next = !current;
    setContactList(
      contactList.map((c) => (c.id === id ? { ...c, visible: next } : c))
    );
    startContactTransition(async () => {
      await toggleVisibleContactMethodAction(id, next);
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <span>Messages Inbox</span>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="channels">Contact Channels</TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: MESSAGES INBOX                      */}
        {/* ========================================== */}
        <TabsContent value="inbox" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Inquiries & Project Briefs
              </h3>
              <p className="text-xs text-muted-foreground font-mono uppercase">
                {unreadCount} new submissions · {msgList.length} total received
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {(["all", "new", "read", "replied", "archived"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-mono uppercase border transition-colors cursor-pointer",
                      statusFilter === status
                        ? "border-primary bg-primary text-primary-foreground font-bold"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center border border-border bg-background space-y-2">
              <Inbox className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No messages match the selected filter.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === "new") {
                      handleUpdateStatus(msg.id, "read");
                    }
                  }}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border bg-surface cursor-pointer hover:border-primary transition-all",
                    msg.status === "new"
                      ? "border-primary/60 bg-surface shadow-sm"
                      : "border-border opacity-90"
                  )}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {msg.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        &lt;{msg.email}&gt;
                      </span>
                      {msg.status === "new" && (
                        <Badge variant="default" className="text-[9px]">
                          NEW
                        </Badge>
                      )}
                      {msg.status === "replied" && (
                        <Badge variant="secondary" className="text-[9px]">
                          Replied
                        </Badge>
                      )}
                      {msg.status === "archived" && (
                        <span className="font-mono text-[9px] uppercase text-muted-foreground">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground truncate">
                      {msg.subject}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {msg.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center self-end flex-shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(msg.id);
                      }}
                      className="p-1 border border-border hover:text-danger hover:border-danger/40 transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message Detail Dialog */}
          <Dialog
            open={!!selectedMessage}
            onOpenChange={(open) => !open && setSelectedMessage(null)}
          >
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6">
                  <span>{selectedMessage?.subject}</span>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    {selectedMessage &&
                      new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </DialogTitle>
              </DialogHeader>

              {selectedMessage && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-background border border-border text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground uppercase">From: </span>
                      <span className="font-bold text-foreground">
                        {selectedMessage.name}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        ({selectedMessage.email})
                      </span>
                    </div>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject
                      )}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <span>Reply via Email</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Project Brief Details (if provided) */}
                  {selectedMessage.briefDetails && (
                    <div className="p-3 border border-border bg-background/50 space-y-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                        Brief Specifications
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        {Object.entries(selectedMessage.briefDetails).map(
                          ([k, v]) => (
                            <div key={k}>
                              <span className="text-muted-foreground capitalize">
                                {k}:{" "}
                              </span>
                              <span className="text-foreground">
                                {String(v)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="border border-border p-4 bg-background whitespace-pre-wrap text-sm text-foreground">
                    {selectedMessage.content}
                  </div>

                  {/* Quick Status Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1">
                        Status:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(selectedMessage.id, "read")
                        }
                        className={cn(
                          "px-2 py-0.5 text-xs font-mono uppercase border",
                          selectedMessage.status === "read"
                            ? "border-primary bg-background text-primary font-bold"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Read
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(selectedMessage.id, "replied")
                        }
                        className={cn(
                          "px-2 py-0.5 text-xs font-mono uppercase border",
                          selectedMessage.status === "replied"
                            ? "border-success bg-background text-success font-bold"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Replied
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(selectedMessage.id, "archived")
                        }
                        className={cn(
                          "px-2 py-0.5 text-xs font-mono uppercase border",
                          selectedMessage.status === "archived"
                            ? "border-border bg-background text-muted-foreground font-bold"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Archived
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="hover:text-danger hover:border-danger/40"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: CONTACT CHANNELS                    */}
        {/* ========================================== */}
        <TabsContent value="channels" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Public Contact Channels & Links
              </h3>
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Rendered as hex buttons on the /contact room
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingContactId(null);
                setContactForm({
                  type: "email",
                  label: "",
                  value: "",
                  icon: "Mail",
                  order: contactList.length + 1,
                  visible: true,
                });
                setContactDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Channel
            </Button>
          </div>

          {contactList.length === 0 ? (
            <div className="p-8 text-center border border-border bg-background space-y-2">
              <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No contact methods configured yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contactList.map((c, idx) => (
                <SortableListItem
                  key={c.id}
                  id={c.id}
                  index={idx}
                  total={contactList.length}
                  isPublished={c.visible}
                  onMoveUp={() => handleMoveContactMethod(idx, idx - 1)}
                  onMoveDown={() => handleMoveContactMethod(idx, idx + 1)}
                  onTogglePublished={() =>
                    handleToggleVisibleContact(c.id, c.visible)
                  }
                  onEdit={() => {
                    setEditingContactId(c.id);
                    setContactForm({
                      type: c.type,
                      label: c.label,
                      value: c.value,
                      icon: c.icon,
                      order: c.order,
                      visible: c.visible,
                    });
                    setContactDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteContactMethod(c.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase px-2 py-0.5 border border-border bg-background text-primary">
                      {c.type}
                    </span>
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-foreground block">
                        {c.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground block truncate">
                        {c.value}
                      </span>
                    </div>
                  </div>
                </SortableListItem>
              ))}
            </div>
          )}

          {/* Contact Method Dialog */}
          <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingContactId
                    ? "Edit Contact Method"
                    : "New Contact Method"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSaveContactMethod} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Method Type
                    </label>
                    <Select
                      value={contactForm.type}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          type: e.target.value as ContactMethodInput["type"],
                        })
                      }
                    >
                      <option value="email">Email</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="x">X / Twitter</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                      <option value="phone">Phone</option>
                      <option value="cal">Cal.com Booking</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Icon Name
                    </label>
                    <Input
                      value={contactForm.icon}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          icon: e.target.value,
                        })
                      }
                      placeholder="Mail, Github, Linkedin..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Display Label
                  </label>
                  <Input
                    value={contactForm.label}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        label: e.target.value,
                      })
                    }
                    placeholder="e.g. Email Direct or GitHub Profile"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Target Value / URL / Number
                  </label>
                  <Input
                    value={contactForm.value}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        value: e.target.value,
                      })
                    }
                    placeholder="mailto:hello@lonnex.dev or https://..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setContactDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={contactPending}
                  >
                    Save Method
                  </HexButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
