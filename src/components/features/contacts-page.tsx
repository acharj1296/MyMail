"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Building2, ContactRound, Mail, MoreHorizontal, Plus, Search, Tag, Trash2, UserRound } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { contactSchema } from "@/lib/validation/schemas";
import { mockContactService } from "@/lib/services/mock-services";
import { useDemoStore } from "@/stores/demo-store";
import type { Contact } from "@/types";
import { initials, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";

const contactFormSchema = contactSchema.extend({ tags: z.string().optional().default(""), notes: z.string().optional().default("") });
type ContactFormValues = z.input<typeof contactFormSchema>;
type ContactFormOutput = z.output<typeof contactFormSchema>;

export function ContactsPage() {
  const contacts = useDemoStore((state) => state.contacts);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(contacts[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const filtered = useMemo(() => contacts.filter((contact) => `${contact.name} ${contact.email} ${contact.company} ${contact.tags.join(" ")}`.toLowerCase().includes(search.trim().toLowerCase())), [contacts, search]);
  const selected = contacts.find((contact) => contact.id === selectedId) ?? filtered[0] ?? null;
  const form = useForm<ContactFormValues, unknown, ContactFormOutput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", company: "", tags: "", notes: "" },
  });

  const startCreate = () => { setEditing(null); form.reset({ name: "", email: "", company: "", tags: "", notes: "" }); setOpen(true); };
  const startEdit = (contact: Contact) => { setEditing(contact); form.reset({ name: contact.name, email: contact.email, company: contact.company, tags: contact.tags.join(", "), notes: contact.notes }); setOpen(true); };
  const save = async (values: ContactFormOutput) => {
    const payload = { name: values.name.trim(), email: values.email.trim(), company: values.company.trim(), tags: (values.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean), notes: values.notes || "" };
    if (editing) { await mockContactService.update(editing.id, payload); setSelectedId(editing.id); toast.success("Contact updated"); }
    else { const created = await mockContactService.add(payload); setSelectedId(created.id); toast.success("Contact added"); }
    setOpen(false);
  };
  const remove = async () => { if (!deleteTarget) return; await mockContactService.remove(deleteTarget.id); if (selectedId === deleteTarget.id) setSelectedId(null); setDeleteTarget(null); toast.success("Contact removed from demo contacts"); };

  return (
    <>
      <PageHeader eyebrow="People" title="Contacts" description="Keep the people behind your conversations organized in this local demo." actions={<Button onClick={startCreate}><Plus className="h-4 w-4" />Add contact</Button>} />
      <div className="grid gap-5 xl:grid-cols-[minmax(360px,.92fr)_minmax(0,1.08fr)]">
        <Card className="min-w-0 overflow-hidden">
          <div className="border-b border-border p-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search contacts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" className="h-10 pl-9" /></div><div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>{filtered.length} people</span><span>Demo contacts</span></div></div>
          <div className="max-h-[620px] overflow-y-auto">
            {filtered.length ? filtered.map((contact) => <button type="button" key={contact.id} onClick={() => setSelectedId(contact.id)} className={cn("flex w-full items-center gap-3 border-b border-border/70 px-4 py-3.5 text-left transition last:border-0 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", selected?.id === contact.id && "bg-primary/[.05]")}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-300">{initials(contact.name)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{contact.name}</span><span className="mt-1 block truncate text-[10px] text-muted-foreground">{contact.email}</span></span><span className="hidden max-w-[100px] truncate text-[10px] text-muted-foreground md:block">{contact.company || "—"}</span></button>) : <div className="p-4"><EmptyState icon={ContactRound} title={contacts.length ? "No contacts found" : "No contacts yet"} description={contacts.length ? "Try another name, email, company, or tag." : "Add a contact to start a lightweight address book."} action={contacts.length ? <Button variant="secondary" size="sm" onClick={() => setSearch("")}>Clear search</Button> : <Button size="sm" onClick={startCreate}><Plus className="h-4 w-4" />Add contact</Button>} className="min-h-[280px]" /></div>}
          </div>
        </Card>
        {selected ? <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex-row items-start justify-between border-b border-border"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-sm font-bold text-violet-600 dark:text-violet-300">{initials(selected.name)}</span><div><CardTitle>{selected.name}</CardTitle><p className="mt-1 text-xs text-muted-foreground">Contact details</p></div></div><DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon-sm" aria-label="Contact actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" className="z-50 rounded-xl border border-border bg-card p-1 shadow-soft outline-none"><DropdownMenu.Item onSelect={() => startEdit(selected)} className="cursor-pointer rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted">Edit contact</DropdownMenu.Item><DropdownMenu.Item onSelect={() => setDeleteTarget(selected)} className="cursor-pointer rounded-lg px-3 py-2 text-xs text-destructive outline-none hover:bg-destructive/5">Delete contact</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-6">
            <div className="space-y-3"><DetailRow icon={Mail} label="Email" value={selected.email} href={`mailto:${selected.email}`} /><DetailRow icon={Building2} label="Company" value={selected.company || "Not specified"} /><DetailRow icon={UserRound} label="Added" value={format(new Date(selected.createdAt), "MMMM d, yyyy")} /></div>
            <div><p className="flex items-center gap-2 text-xs font-semibold"><Tag className="h-3.5 w-3.5 text-muted-foreground" />Tags</p><div className="mt-2 flex flex-wrap gap-1.5">{selected.tags.length ? selected.tags.map((tag) => <Badge tone="primary" key={tag}>{tag}</Badge>) : <span className="text-xs text-muted-foreground">No tags</span>}</div></div>
            <div><p className="text-xs font-semibold">Notes</p><p className="mt-2 min-h-[80px] whitespace-pre-wrap rounded-xl border border-border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">{selected.notes || "No notes added."}</p></div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-4"><a href={`mailto:${selected.email}`} className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white transition hover:brightness-105"><Mail className="h-3.5 w-3.5" />Open email app</a><Button variant="secondary" size="sm" onClick={() => startEdit(selected)}>Edit contact</Button></div>
            <p className="text-[10px] leading-5 text-muted-foreground">Email links open your device’s mail app. This demo does not send from Mailflare.</p>
          </CardContent>
        </Card> : <EmptyState icon={ContactRound} title="Select a contact" description="Choose a contact from the list to see their details." className="min-h-[360px]" />}
      </div>

      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit contact" : "Add a contact"}</DialogTitle><DialogDescription>Contact details are saved locally in this browser demo.</DialogDescription></DialogHeader><form onSubmit={form.handleSubmit(save)} className="space-y-4 px-6 py-5">
        <Field><FieldLabel htmlFor="contact-name">Name</FieldLabel><Input id="contact-name" autoFocus {...form.register("name")} /><FieldError>{form.formState.errors.name?.message}</FieldError></Field>
        <Field><FieldLabel htmlFor="contact-email">Email address</FieldLabel><Input id="contact-email" type="email" {...form.register("email")} /><FieldError>{form.formState.errors.email?.message}</FieldError></Field>
        <Field><FieldLabel htmlFor="contact-company">Company</FieldLabel><Input id="contact-company" {...form.register("company")} /></Field>
        <Field><FieldLabel htmlFor="contact-tags">Tags</FieldLabel><Input id="contact-tags" placeholder="Client, Design" {...form.register("tags")} /><FieldHint>Separate multiple tags with commas.</FieldHint></Field>
        <Field><FieldLabel htmlFor="contact-notes">Notes</FieldLabel><Textarea id="contact-notes" rows={3} {...form.register("notes")} /></Field>
        <DialogFooter className="-mx-6 -mb-5"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : editing ? "Save changes" : "Add contact"}</Button></DialogFooter>
      </form></DialogContent></Dialog>
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Delete {deleteTarget?.name}?</DialogTitle><DialogDescription>This contact will be removed from local demo data. This can’t be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={() => void remove()}><Trash2 className="h-4 w-4" />Delete contact</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}

function DetailRow({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const inner = <><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[10px] text-muted-foreground">{label}</span><span className="mt-0.5 block truncate text-xs font-medium">{value}</span></span></>;
  return href ? <a href={href} className="flex items-center gap-3 rounded-xl transition hover:bg-muted/40">{inner}</a> : <div className="flex items-center gap-3">{inner}</div>;
}
