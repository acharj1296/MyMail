"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bold, FilePlus2, Italic, Link2, LoaderCircle, List, Mail, Paperclip, Send, Underline, X } from "lucide-react";
import { toast } from "sonner";
import { composeSchema } from "@/lib/validation/schemas";
import { mockEmailService } from "@/lib/services/mock-services";
import { useDemoStore } from "@/stores/demo-store";
import { formatBytes, makeId } from "@/lib/utils";
import type { Attachment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";

const composeFormSchema = composeSchema.extend({ cc: z.string().optional().default(""), bcc: z.string().optional().default("") }).superRefine((values, context) => {
  for (const field of ["cc", "bcc"] as const) {
    const addresses = values[field].split(/[;,]/).map((entry) => entry.trim()).filter(Boolean);
    if (addresses.some((entry) => !z.string().email().safeParse(entry).success)) context.addIssue({ code: "custom", path: [field], message: "Enter valid email addresses separated by commas." });
  }
});
type ComposeInput = z.input<typeof composeFormSchema>;
type ComposeOutput = z.output<typeof composeFormSchema>;

export function ComposePage({ initialDraftId = "", replyId = "", forwardId = "" }: { initialDraftId?: string; replyId?: string; forwardId?: string }) {
  const router = useRouter();
  const user = useDemoStore((state) => state.user);
  const preferences = useDemoStore((state) => state.preferences);
  const domains = useDemoStore((state) => state.domains);
  const saveDraftStore = useDemoStore((state) => state.saveDraft);
  const deleteDraft = useDemoStore((state) => state.deleteDraft);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [draftId, setDraftId] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [autoSavedAt, setAutoSavedAt] = useState<number | null>(null);

  const form = useForm<ComposeInput, unknown, ComposeOutput>({
    resolver: zodResolver(composeFormSchema),
    defaultValues: { to: "", cc: "", bcc: "", subject: "", body: "", sender: preferences.defaultSender || user.email },
    mode: "onBlur",
  });
  const watched = useWatch({ control: form.control });
  const allSenders = useMemo(() => Array.from(new Set([user.email, ...domains.flatMap((domain) => domain.identities), preferences.defaultSender].filter(Boolean))), [domains, preferences.defaultSender, user.email]);
  const hasContent = Boolean(watched.to?.trim() || watched.subject?.trim() || watched.body?.trim() || files.length);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const sourceId = initialDraftId || replyId || forwardId;
      const source = sourceId ? useDemoStore.getState().emails.find((email) => email.id === sourceId) : undefined;
      if (initialDraftId && source?.folder === "drafts") {
        setDraftId(source.id);
        setFiles(source.attachments);
        form.reset({ to: source.to.map((entry) => entry.email).join(", "), cc: source.cc?.map((entry) => entry.email).join(", ") ?? "", bcc: "", subject: source.subject === "(no subject)" ? "" : source.subject, body: source.body, sender: source.from.email });
      } else if (source && (replyId || forwardId)) {
        const isForward = Boolean(forwardId);
        const recipient = isForward ? "" : source.from.email;
        const subject = isForward ? `Fwd: ${source.subject}` : /^re:/i.test(source.subject) ? source.subject : `Re: ${source.subject}`;
        const body = isForward ? `\n\n---------- Forwarded message ----------\nFrom: ${source.from.name} <${source.from.email}>\nSubject: ${source.subject}\n\n${source.body}` : `\n\nOn ${new Date(source.date).toLocaleString()}, ${source.from.name} wrote:\n> ${source.body.replace(/\n/g, "\n> ")}`;
        form.reset({ to: recipient, cc: "", bcc: "", subject, body, sender: preferences.defaultSender || user.email });
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  // The page initializes once from the route, then the form is controlled by the user.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded || !form.formState.isDirty || !hasContent || sending) return;
    const timer = window.setTimeout(() => {
      const values = form.getValues();
      const id = saveDraftStore({ ...values, id: draftId, attachments: files });
      setDraftId(id);
      form.reset(values);
      setAutoSavedAt(Date.now());
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [draftId, files, form, form.formState.isDirty, hasContent, loaded, saveDraftStore, sending, watched]);

  useEffect(() => {
    if (!form.formState.isDirty || !hasContent) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.formState.isDirty, hasContent]);

  const saveDraftNow = async () => {
    const values = form.getValues();
    if (!hasContent) { toast.info("Add a recipient, subject, or message before saving a draft."); return; }
    setSaving(true);
    try {
      const id = await mockEmailService.saveDraft({ ...values, id: draftId, attachments: files });
      setDraftId(id);
      form.reset(values);
      setAutoSavedAt(Date.now());
      toast.success("Draft saved", { description: "Saved in this browser only." });
    } catch { toast.error("Could not save draft", { description: "Your message is still open. Try again." }); }
    finally { setSaving(false); }
  };

  const send = async (values: ComposeOutput) => {
    setSending(true);
    try {
      await mockEmailService.send({ ...values, id: draftId, attachments: files });
      toast.success("Added to Sent in demo mode", { description: "Nothing was transmitted or delivered." });
      router.push("/app/sent");
    } catch { toast.error("Simulated send failed", { description: "Your draft is still available to edit." }); }
    finally { setSending(false); }
  };

  const confirmDiscard = () => {
    if (hasContent && !window.confirm("Discard this message? Unsaved changes will be lost.")) return;
    if (draftId) deleteDraft(draftId);
    toast.success("Message discarded from this demo");
    router.push("/app/inbox");
  };

  const formatSelection = (prefix: string, suffix = prefix) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = form.getValues("body") || "";
    const selection = value.slice(start, end) || "text";
    const next = `${value.slice(0, start)}${prefix}${selection}${suffix}${value.slice(end)}`;
    form.setValue("body", next, { shouldDirty: true, shouldValidate: true });
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length); });
  };
  const bodyRegister = form.register("body");

  const insertLink = () => {
    const url = window.prompt("Enter a link URL (https://…)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) { toast.error("Use a full URL beginning with http:// or https://"); return; }
    formatSelection("[", `](${url})`);
  };
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).map((file) => ({ id: makeId("attachment"), name: file.name, size: formatBytes(file.size), type: file.type || "File" }));
    setFiles((current) => [...current, ...incoming].slice(0, 8));
    toast.info(`${incoming.length} file${incoming.length === 1 ? "" : "s"} added to the demo composer`, { description: "Only file names and sizes are used. No files are uploaded." });
  };

  return (
    <>
      <PageHeader eyebrow="Mailbox" title="Compose message" description="Write a message in the local demo. Sending never transmits email." actions={<Button variant="secondary" onClick={confirmDiscard}><ArrowLeft className="h-4 w-4" />Back to inbox</Button>} />
      <form onSubmit={form.handleSubmit(send)} className="mx-auto max-w-[930px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-6"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></span><div><p className="text-xs font-semibold">New message</p><p className="text-[10px] text-muted-foreground">{autoSavedAt ? `Saved ${new Date(autoSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Draft auto-saves locally"}</p></div></div><Badge tone="warning">Demo send only</Badge></div>
          <div className="px-4 sm:px-6">
            <div className="flex min-h-[56px] items-center gap-2 border-b border-border"><FieldLabel htmlFor="compose-to" className="w-14 shrink-0 text-xs text-muted-foreground">To</FieldLabel><Input id="compose-to" autoFocus placeholder="name@example.com, another@example.com" autoComplete="off" className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" {...form.register("to")} /><button type="button" onClick={() => setShowCc((value) => !value)} className="text-[10px] font-semibold text-muted-foreground hover:text-primary">Cc</button><button type="button" onClick={() => setShowBcc((value) => !value)} className="text-[10px] font-semibold text-muted-foreground hover:text-primary">Bcc</button></div>
            <FieldError>{form.formState.errors.to?.message}</FieldError>
            {showCc && <div className="flex min-h-[48px] items-center gap-2 border-b border-border"><FieldLabel htmlFor="compose-cc" className="w-14 shrink-0 text-xs text-muted-foreground">Cc</FieldLabel><Input id="compose-cc" placeholder="cc@example.com" className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" {...form.register("cc")} /><button type="button" onClick={() => { setShowCc(false); form.setValue("cc", "", { shouldDirty: true }); }} aria-label="Remove Cc field" className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button></div>}{showCc && <FieldError>{form.formState.errors.cc?.message}</FieldError>}
            {showBcc && <div className="flex min-h-[48px] items-center gap-2 border-b border-border"><FieldLabel htmlFor="compose-bcc" className="w-14 shrink-0 text-xs text-muted-foreground">Bcc</FieldLabel><Input id="compose-bcc" placeholder="bcc@example.com" className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" {...form.register("bcc")} /><button type="button" onClick={() => { setShowBcc(false); form.setValue("bcc", "", { shouldDirty: true }); }} aria-label="Remove Bcc field" className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button></div>}{showBcc && <FieldError>{form.formState.errors.bcc?.message}</FieldError>}
            <div className="flex min-h-[52px] items-center gap-2 border-b border-border"><FieldLabel htmlFor="compose-subject" className="w-14 shrink-0 text-xs text-muted-foreground">Subject</FieldLabel><Input id="compose-subject" placeholder="Add a subject" className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" {...form.register("subject")} /></div><FieldError>{form.formState.errors.subject?.message}</FieldError>
            <div className="flex min-h-[52px] items-center gap-2 border-b border-border"><FieldLabel htmlFor="compose-sender" className="w-14 shrink-0 text-xs text-muted-foreground">From</FieldLabel><select id="compose-sender" className="h-10 min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none" {...form.register("sender")}>{allSenders.map((sender) => <option key={sender} value={sender}>{sender}</option>)}</select><span className="hidden text-[10px] text-muted-foreground sm:block">Mock sender identity</span></div>
          </div>

          <div className="border-b border-border bg-muted/25 px-3 py-2 sm:px-5"><div className="flex flex-wrap items-center gap-1">
            <FormatButton icon={Bold} label="Bold" onClick={() => formatSelection("**")} /><FormatButton icon={Italic} label="Italic" onClick={() => formatSelection("_")} /><FormatButton icon={Underline} label="Underline" onClick={() => formatSelection("__")} /><span className="mx-1 h-5 w-px bg-border" /><FormatButton icon={List} label="Add a bullet" onClick={() => formatSelection("• ", "")} /><FormatButton icon={Link2} label="Insert link" onClick={insertLink} /><label className="ml-auto flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"><Paperclip className="h-3.5 w-3.5" />Attach<input type="file" multiple className="sr-only" onChange={(event) => { addFiles(event.currentTarget.files); event.currentTarget.value = ""; }} /></label>
          </div></div>
          <div className="p-4 sm:p-6"><Textarea id="compose-body" aria-label="Message body" placeholder="Write your message…\n\nFormatting buttons wrap selected text with simple markers for this demo." className="min-h-[310px] resize-y rounded-none border-0 bg-transparent px-0 text-sm leading-7 shadow-none focus-visible:ring-0" {...bodyRegister} ref={(element) => { bodyRegister.ref(element); editorRef.current = element; }} /><FieldError>{form.formState.errors.body?.message}</FieldError>
            {files.length > 0 && <div className="mt-4 space-y-2"><p className="text-[10px] font-semibold text-muted-foreground">Attachments · local metadata only</p>{files.map((file) => <div key={file.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 py-2"><FilePlus2 className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate text-xs font-medium">{file.name}</span><span className="text-[10px] text-muted-foreground">{file.size}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>)}</div>}
          </div>
          <div className="flex flex-col gap-3 border-t border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="max-w-md text-[10px] leading-5 text-muted-foreground">Demo mode: send creates a local Sent item only. No email or attachment is transmitted. Drafts are stored in this browser.</p>
            <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => void saveDraftNow()} disabled={saving}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}{saving ? "Saving…" : "Save draft"}</Button><Button type="button" variant="secondary" size="sm" onClick={confirmDiscard}>Discard</Button><Button type="submit" size="sm" disabled={sending}>{sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{sending ? "Sending demo…" : "Send in demo"}</Button></div>
          </div>
        </Card>
      </form>
    </>
  );
}

function FormatButton({ icon: Icon, label, onClick }: { icon: typeof Bold; label: string; onClick: () => void }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon className="h-4 w-4" /></button>;
}
