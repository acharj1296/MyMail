"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNowStrict, isThisYear } from "date-fns";
import { Archive, ArrowLeft, ChevronDown, FileText, Forward, Inbox, Mail, MailOpen, MoreHorizontal, Paperclip, RefreshCw, Reply, Search, Star, Trash2, X } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useDemoStore } from "@/stores/demo-store";
import { initials, cn } from "@/lib/utils";
import type { EmailFolder, EmailMessage } from "@/types";
import { toast } from "sonner";

const folderInfo: Record<string, { title: string; description: string; emptyTitle: string; emptyDescription: string }> = {
  inbox: { title: "Inbox", description: "A tidy view of messages received by your demo mailboxes.", emptyTitle: "Your inbox is all clear", emptyDescription: "New messages would land here. This demo uses fictional sample messages." },
  sent: { title: "Sent", description: "Messages created in the local demo workspace.", emptyTitle: "Nothing sent yet", emptyDescription: "Messages you send in demo mode appear here, but are never delivered." },
  drafts: { title: "Drafts", description: "Pick up where you left off with saved drafts.", emptyTitle: "No drafts yet", emptyDescription: "Save a message as a draft to come back to it later." },
  starred: { title: "Starred", description: "Keep important conversations close at hand.", emptyTitle: "No starred messages", emptyDescription: "Star a message to find it quickly here." },
  archive: { title: "Archive", description: "Messages you’ve tucked away from your inbox.", emptyTitle: "Nothing in the archive", emptyDescription: "Archived messages will be kept here, out of your inbox." },
  trash: { title: "Trash", description: "Messages moved to trash in this browser demo.", emptyTitle: "Trash is empty", emptyDescription: "Deleted demo messages appear here until restored or removed from this view." },
};

type FilterMode = "all" | "unread" | "read" | "starred";

function messageDisplayName(message: EmailMessage, folder: string) {
  if (folder === "sent") return `To ${message.to.map((recipient) => recipient.name || recipient.email).join(", ")}`;
  if (folder === "drafts") return `Draft to ${message.to.map((recipient) => recipient.name || recipient.email).join(", ") || "new recipient"}`;
  return message.from.name;
}

function messageDisplayEmail(message: EmailMessage, folder: string) {
  if (folder === "sent" || folder === "drafts") return message.to.map((recipient) => recipient.email).join(", ");
  return message.from.email;
}

function dateLabel(date: string) {
  const parsed = new Date(date);
  const days = (Date.now() - parsed.getTime()) / 86_400_000;
  return days < 6 ? formatDistanceToNowStrict(parsed, { addSuffix: false }) : format(parsed, isThisYear(parsed) ? "MMM d" : "MMM d, yyyy");
}

export function MailboxPage({ folder, initialSearch = "", initialOpen = "" }: { folder: string; initialSearch?: string; initialOpen?: string }) {
  const router = useRouter();
  const emails = useDemoStore((state) => state.emails);
  const toggleStar = useDemoStore((state) => state.toggleStar);
  const setMessagesRead = useDemoStore((state) => state.setMessagesRead);
  const moveMessages = useDemoStore((state) => state.moveMessages);
  const deleteDraft = useDemoStore((state) => state.deleteDraft);
  const permanentlyDeleteMessages = useDemoStore((state) => state.permanentlyDeleteMessages);
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(initialOpen || null);
  const [refreshing, setRefreshing] = useState(false);

  const base = useMemo(() => {
    if (folder === "starred") return emails.filter((email) => email.starred && email.folder !== "trash");
    return emails.filter((email) => email.folder === folder);
  }, [emails, folder]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return base.filter((email) => {
      const termMatch = !term || [email.from.name, email.from.email, email.to.map((to) => `${to.name} ${to.email}`).join(" "), email.subject, email.preview, email.body, ...email.labels].join(" ").toLowerCase().includes(term);
      const filterMatch = filter === "all" || (filter === "unread" && !email.read) || (filter === "read" && email.read) || (filter === "starred" && email.starred);
      return termMatch && filterMatch;
    }).sort((a, b) => sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [base, filter, search, sortNewest]);
  const selectedMessage = selectedMessageId ? emails.find((email) => email.id === selectedMessageId) : undefined;
  const isDraftFolder = folder === "drafts";
  const isTrash = folder === "trash";
  const info = folderInfo[folder] ?? folderInfo.inbox;

  const openMessage = (message: EmailMessage) => {
    if (isDraftFolder) { router.push(`/app/compose?draft=${encodeURIComponent(message.id)}`); return; }
    setSelectedMessageId(message.id);
    if (!message.read) setMessagesRead([message.id], true);
  };
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((message) => message.id));
  const bulkMove = (destination: EmailFolder) => {
    if (!selectedIds.length) return;
    moveMessages(selectedIds, destination);
    toast.success(destination === "archive" ? "Moved to archive" : destination === "trash" ? "Moved to trash" : "Restored to inbox", { description: `${selectedIds.length} message${selectedIds.length === 1 ? "" : "s"} updated in the demo.` });
    setSelectedIds([]);
    if (selectedMessageId && selectedIds.includes(selectedMessageId)) setSelectedMessageId(null);
  };
  const doRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => { setRefreshing(false); toast.success("Inbox refreshed", { description: "Sample messages are up to date in this local demo." }); }, 550);
  };
  const openComposer = (message: EmailMessage, kind: "reply" | "forward") => {
    router.push(`/app/compose?${kind}=${encodeURIComponent(message.id)}`);
  };
  const handleDeleteDraft = (message: EmailMessage) => {
    if (window.confirm("Delete this draft from the local demo?")) {
      deleteDraft(message.id);
      setSelectedMessageId(null);
      toast.success("Draft deleted");
    }
  };

  return (
    <>
      <PageHeader eyebrow="Mailbox" title={selectedMessage ? "Message" : info.title} description={selectedMessage ? "Review the conversation details below." : info.description} actions={!selectedMessage && <Button onClick={() => router.push("/app/compose")}><Mail className="h-4 w-4" />Compose</Button>} />
      <Card className="min-h-[480px] overflow-hidden">
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} onBack={() => setSelectedMessageId(null)} onReply={(kind) => openComposer(selectedMessage, kind)} onStar={() => toggleStar(selectedMessage.id)} onArchive={() => { bulkMoveOne(selectedMessage.id, "archive"); setSelectedMessageId(null); }} onDelete={() => { if (isDraftFolder) handleDeleteDraft(selectedMessage); else { bulkMoveOne(selectedMessage.id, "trash"); setSelectedMessageId(null); } }} onRestore={() => { bulkMoveOne(selectedMessage.id, "inbox"); setSelectedMessageId(null); }} onAttachment={() => toast.info("Attachment preview", { description: "File previews are not available in this frontend demo." })} folder={folder} />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedIds.length > 0 ? <>
                  <Button variant="ghost" size="icon-sm" onClick={toggleAll} aria-label="Clear selected messages"><X className="h-4 w-4" /></Button>
                  <span className="mr-1 text-xs font-semibold">{selectedIds.length} selected</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => setMessagesRead(selectedIds, false)} aria-label="Mark selected unread" title="Mark unread"><Mail className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setMessagesRead(selectedIds, true)} aria-label="Mark selected read" title="Mark read"><MailOpen className="h-4 w-4" /></Button>
                  {isTrash ? <Button variant="ghost" size="icon-sm" onClick={() => bulkMove("inbox")} aria-label="Restore selected"><Inbox className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon-sm" onClick={() => bulkMove("archive")} aria-label="Archive selected"><Archive className="h-4 w-4" /></Button>}
                  {!isTrash && <Button variant="ghost" size="icon-sm" onClick={() => bulkMove("trash")} aria-label="Delete selected"><Trash2 className="h-4 w-4" /></Button>}
                  {isTrash && <Button variant="ghost" size="icon-sm" onClick={() => { permanentlyDeleteMessages(selectedIds); toast.success(`${selectedIds.length} message${selectedIds.length === 1 ? "" : "s"} permanently removed from the local demo.`); setSelectedIds([]); }} aria-label="Permanently delete selected" title="Permanently delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </> : <>
                  <Button variant="ghost" size="icon-sm" onClick={toggleAll} aria-label={selectedIds.length === filtered.length && filtered.length > 0 ? "Deselect all messages" : "Select all messages"} title="Select all"><span className={cn("h-3.5 w-3.5 rounded border border-muted-foreground/50", filtered.length > 0 && selectedIds.length === filtered.length && "border-primary bg-primary")} /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={doRefresh} aria-label="Refresh messages" title="Refresh"><RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /></Button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2.5 text-xs"><span>{filter === "all" ? "All messages" : filter === "unread" ? "Unread" : filter === "read" ? "Read" : "Starred"}</span><ChevronDown className="h-3.5 w-3.5" /></Button></DropdownMenu.Trigger>
                    <DropdownMenu.Portal><DropdownMenu.Content align="start" sideOffset={5} className="z-50 min-w-[150px] rounded-xl border border-border bg-card p-1 shadow-soft outline-none">{(["all", "unread", "read", "starred"] as FilterMode[]).map((mode) => <DropdownMenu.Item key={mode} onSelect={() => setFilter(mode)} className="cursor-pointer rounded-lg px-3 py-2 text-xs capitalize outline-none hover:bg-muted">{mode === "all" ? "All messages" : mode}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </>}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:w-[220px] sm:flex-none"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages" aria-label="Search messages" className="h-9 rounded-lg border-transparent bg-muted/65 pl-9 text-xs focus:bg-card" /></div>
                <Button variant="secondary" size="sm" className="h-9 gap-1.5 px-3 text-xs" onClick={() => setSortNewest((value) => !value)} title="Change date sort order"><span className="hidden xs:inline">Date</span><ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !sortNewest && "rotate-180")} /></Button>
              </div>
            </div>
            {filtered.length ? <div role="list" aria-label={`${info.title} message list`} className="divide-y divide-border/75">
              {filtered.map((message) => <MessageRow key={message.id} message={message} folder={folder} selected={selectedIds.includes(message.id)} onSelected={() => toggleSelected(message.id)} onOpen={() => openMessage(message)} onStar={() => toggleStar(message.id)} />)}
            </div> : <div className="p-4 sm:p-7"><EmptyState icon={Inbox} title={base.length ? "No messages match" : info.emptyTitle} description={base.length ? "Try another search or remove a filter to see more messages." : info.emptyDescription} action={base.length ? <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setFilter("all"); }}>Clear search and filters</Button> : <Button size="sm" onClick={() => router.push("/app/compose")}><Mail className="h-4 w-4" />Write a message</Button>} /></div>}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-[10px] text-muted-foreground sm:px-5"><span>Showing {filtered.length ? 1 : 0}–{filtered.length} of {filtered.length} demo messages</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Local data</span></div>
          </>
        )}
      </Card>
    </>
  );

  function bulkMoveOne(id: string, destination: EmailFolder) {
    moveMessages([id], destination);
    toast.success(destination === "archive" ? "Message archived" : destination === "trash" ? "Message moved to trash" : "Message restored to inbox");
  }
}

function MessageRow({ message, folder, selected, onSelected, onOpen, onStar }: { message: EmailMessage; folder: string; selected: boolean; onSelected: () => void; onOpen: () => void; onStar: () => void }) {
  const displayName = messageDisplayName(message, folder);
  const displayEmail = messageDisplayEmail(message, folder);
  return (
    <div role="listitem" className={cn("message-row group flex min-h-[72px] items-center gap-2 px-3 py-3 transition sm:gap-3 sm:px-4", selected && "bg-primary/[.055]", !message.read && "bg-primary/[.025] hover:bg-primary/[.055]", message.read && "hover:bg-muted/45")}>
      <button type="button" onClick={(event) => { event.stopPropagation(); onSelected(); }} aria-label={`${selected ? "Deselect" : "Select"} message ${message.subject}`} aria-pressed={selected} className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selected && "text-primary")}><span className={cn("h-3.5 w-3.5 rounded border", selected ? "border-primary bg-primary" : "border-muted-foreground/45")} /></button>
      <button type="button" onClick={(event) => { event.stopPropagation(); onStar(); }} aria-label={`${message.starred ? "Unstar" : "Star"} message`} aria-pressed={message.starred} className="flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/55 transition hover:bg-muted hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"> <Star className={cn("h-[15px] w-[15px]", message.starred && "fill-amber-400 text-amber-500")} /></button>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-[11px] font-bold text-sky-700 dark:text-sky-300 sm:flex">{initials(displayName.replace(/^To |^Draft to /, "").split(",")[0] || "?")}</span>
        <span className="min-w-0 flex-1"><span className="flex min-w-0 items-center gap-1.5"><span className={cn("max-w-[160px] truncate text-xs", message.read ? "font-medium" : "font-bold")}>{displayName}</span>{message.labels.slice(0, 1).map((label) => <Badge key={label} className="hidden shrink-0 px-1.5 py-0.5 text-[9px] sm:inline-flex">{label}</Badge>)}{!message.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</span>
          <span className="mt-1 flex min-w-0 items-center gap-1.5"><span className={cn("truncate text-xs", message.read ? "font-medium text-foreground/90" : "font-semibold text-foreground")}>{message.subject}</span><span className="hidden truncate text-[11px] text-muted-foreground md:block">— {message.preview}</span></span>
        </span>
        {message.attachments.length > 0 && <Paperclip className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />}
        <span className="ml-auto flex shrink-0 flex-col items-end gap-1"><span className={cn("text-[10px]", message.read ? "text-muted-foreground" : "font-semibold text-foreground")}>{dateLabel(message.date)}</span><span className="max-w-[120px] truncate text-[9px] text-muted-foreground sm:hidden">{displayEmail}</span></span>
      </button>
    </div>
  );
}

function MessageDetail({ message, onBack, onReply, onStar, onArchive, onDelete, onRestore, onAttachment, folder }: { message: EmailMessage; onBack: () => void; onReply: (kind: "reply" | "forward") => void; onStar: () => void; onArchive: () => void; onDelete: () => void; onRestore: () => void; onAttachment: () => void; folder: string }) {
  const isTrash = folder === "trash";
  const isDraft = folder === "drafts";
  return (
    <div className="flex min-h-[480px] flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-3 sm:px-5">
        <div className="flex items-center gap-1"><Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back to message list"><ArrowLeft className="h-4 w-4" /></Button><span className="ml-1 hidden text-xs font-semibold text-muted-foreground sm:inline">Back to {folderInfo[folder]?.title ?? "Inbox"}</span></div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onStar} aria-label={message.starred ? "Unstar message" : "Star message"}><Star className={cn("h-4 w-4", message.starred && "fill-amber-400 text-amber-500")} /></Button>
          {!isDraft && !isTrash && <Button variant="ghost" size="icon-sm" onClick={onArchive} aria-label="Archive message"><Archive className="h-4 w-4" /></Button>}
          {isTrash ? <Button variant="ghost" size="icon-sm" onClick={onRestore} aria-label="Restore message"><Inbox className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={isDraft ? "Delete draft" : "Move to trash"}><Trash2 className="h-4 w-4" /></Button>}
          <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon-sm" aria-label="More message actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={5} className="z-50 rounded-xl border border-border bg-card p-1 shadow-soft outline-none">{isDraft ? <DropdownMenu.Item onSelect={() => onDelete()} className="cursor-pointer rounded-lg px-3 py-2 text-xs text-destructive outline-none hover:bg-muted">Delete draft</DropdownMenu.Item> : <><DropdownMenu.Item onSelect={() => onReply("forward")} className="cursor-pointer rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted">Forward</DropdownMenu.Item><DropdownMenu.Item onSelect={() => onReply("reply")} className="cursor-pointer rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted">Reply</DropdownMenu.Item></>}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
        </div>
      </div>
      {isTrash && <div className="border-b border-amber-500/20 bg-amber-500/[.08] px-5 py-2 text-xs text-amber-800 dark:text-amber-300">This message is in demo trash. Restore it to bring it back to the inbox.</div>}
      <div className="mx-auto w-full max-w-[900px] flex-1 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="max-w-[760px] text-xl font-semibold leading-tight tracking-[-.04em] sm:text-[24px]">{message.subject}</h2>{message.labels.map((label) => <Badge key={label} tone="primary">{label}</Badge>)}</div>
        <div className="mt-6 flex items-start gap-3 border-b border-border pb-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-300">{initials(message.from.name)}</span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-0.5"><p className="text-sm font-semibold">{message.from.name}</p><p className="text-xs text-muted-foreground">&lt;{message.from.email}&gt;</p></div><p className="mt-1 text-[11px] text-muted-foreground">to {message.to.map((to) => to.name ? `${to.name} (${to.email})` : to.email).join(", ") || "yourself"}{message.cc?.length ? ` · cc ${message.cc.map((to) => to.email).join(", ")}` : ""}</p></div>
          <time className="shrink-0 text-[10px] text-muted-foreground sm:text-xs" dateTime={message.date}>{format(new Date(message.date), "MMM d, yyyy · h:mm a")}</time>
        </div>
        <div className="min-h-[190px] whitespace-pre-wrap py-6 text-sm leading-7 text-foreground/90">{message.body || <span className="italic text-muted-foreground">No message content.</span>}</div>
        {message.attachments.length > 0 && <div className="border-t border-border pt-4"><p className="mb-3 text-xs font-semibold">{message.attachments.length} attachment{message.attachments.length === 1 ? "" : "s"}</p><div className="flex flex-wrap gap-2">{message.attachments.map((attachment) => <button type="button" key={attachment.id} onClick={onAttachment} className="flex items-center gap-2 rounded-xl border border-border bg-muted/25 px-3 py-2 text-left transition hover:border-primary/30 hover:bg-muted/60"><FileText className="h-4 w-4 text-primary" /><span><span className="block max-w-[180px] truncate text-xs font-medium">{attachment.name}</span><span className="text-[10px] text-muted-foreground">{attachment.size} · {attachment.type}</span></span></button>)}</div></div>}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">{!isDraft && !isTrash && <><Button variant="secondary" size="sm" onClick={() => onReply("reply")}><Reply className="h-3.5 w-3.5" />Reply</Button><Button variant="secondary" size="sm" onClick={() => onReply("forward")}><Forward className="h-3.5 w-3.5" />Forward</Button></>}{isTrash && <Button variant="secondary" size="sm" onClick={onRestore}><Inbox className="h-3.5 w-3.5" />Restore to inbox</Button>}{isDraft && <Button variant="secondary" size="sm" onClick={() => onReply("reply")}><Mail className="h-3.5 w-3.5" />Continue editing</Button>}</div>
        <p className="mt-5 text-[10px] text-muted-foreground">This is a fictional message shown for product preview only.</p>
      </div>
    </div>
  );
}
