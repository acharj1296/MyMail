"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ChevronDown, MailPlus, MoreHorizontal, Shield, UserPlus, X } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { invitationSchema } from "@/lib/validation/schemas";
import { mockTeamService } from "@/lib/services/mock-services";
import { useDemoStore } from "@/stores/demo-store";
import type { TeamRole } from "@/types";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";

type InviteForm = z.infer<typeof invitationSchema>;

export function TeamPage() {
  const members = useDemoStore((state) => state.teamMembers);
  const invitations = useDemoStore((state) => state.invitations);
  const changeRole = useDemoStore((state) => state.changeMemberRole);
  const [open, setOpen] = useState(false);
  const form = useForm<InviteForm>({ resolver: zodResolver(invitationSchema), defaultValues: { email: "", role: "Member" } });
  const sendInvite = async (values: InviteForm) => {
    await mockTeamService.invite(values.email, values.role);
    setOpen(false);
    form.reset({ email: "", role: "Member" });
    toast.success("Demo invitation added", { description: "No invitation email was sent." });
  };
  const handleRole = (id: string, role: TeamRole) => { changeRole(id, role); toast.success("Demo role updated", { description: "Roles are for UI preview only and do not enforce access." }); };
  return <>
    <PageHeader eyebrow="Workspace administration" title="Team" description="Preview shared workspace membership controls. Roles and invites are simulated only." actions={<Button onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" />Invite member</Button>} />
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/[.045] p-4"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" /><p className="text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Demo administration.</strong> Invites are local list entries; roles do not provide secure permissions and no invite emails are sent.</p></div>
    <div className="mb-5 grid gap-4 sm:grid-cols-3">{[{ label: "Active members", value: members.filter((member) => member.status === "active").length }, { label: "Pending invites", value: invitations.filter((invite) => invite.status === "pending").length }, { label: "Workspace role", value: "Owner-managed" }].map((item) => <Card key={item.label}><CardContent className="p-5"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-2 text-xl font-semibold tracking-[-.04em]">{item.value}</p></CardContent></Card>)}</div>
    <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Workspace members</CardTitle><p className="mt-1 text-xs text-muted-foreground">{members.length} sample members</p></div><Link href="/app/team/invitations" className="text-xs font-semibold text-primary hover:underline">Manage invitations <span aria-hidden="true">→</span></Link></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-y border-border bg-muted/25 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground"><th className="px-6 py-3">Member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last active</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className="border-b border-border/70 text-xs last:border-0"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-[10px] font-bold text-violet-600 dark:text-violet-300">{initials(member.name)}</span><span><span className="block font-semibold">{member.name}</span><span className="mt-1 block text-[10px] text-muted-foreground">{member.email}</span></span></div></td><td className="px-4 py-4">{member.role === "Owner" ? <Badge tone="primary">Owner</Badge> : <DropdownMenu.Root><DropdownMenu.Trigger asChild><button type="button" className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-semibold hover:bg-muted" aria-label={`Change role for ${member.name}`}>{member.role}<ChevronDown className="h-3 w-3" /></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="start" className="z-50 rounded-xl border border-border bg-card p-1 shadow-soft outline-none">{(["Admin", "Member"] as TeamRole[]).map((role) => <DropdownMenu.Item key={role} onSelect={() => handleRole(member.id, role)} className="cursor-pointer rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted">{role}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>}</td><td className="px-4 py-4"><Badge tone={member.status === "active" ? "success" : "warning"}>{member.status}</Badge></td><td className="px-4 py-4 text-[10px] text-muted-foreground">{member.lastActive}</td><td className="px-6 py-4 text-right"><Button variant="ghost" size="icon-sm" onClick={() => toast.info("Member details", { description: `${member.name} · ${member.role} · demo role only.` })} aria-label={`View ${member.name} details`}><MoreHorizontal className="h-4 w-4" /></Button></td></tr>)}</tbody></table></div><div className="border-t border-border bg-muted/20 px-6 py-3 text-[10px] text-muted-foreground">Team data is persisted locally; access is not enforced.</div></CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Invite a teammate</DialogTitle><DialogDescription>Add a pending invitation to this demo workspace. No email will be sent.</DialogDescription></DialogHeader><form onSubmit={form.handleSubmit(sendInvite)} className="space-y-4 px-6 py-5"><Field><FieldLabel htmlFor="invite-email">Email address</FieldLabel><Input id="invite-email" type="email" placeholder="teammate@example.com" autoFocus {...form.register("email")} /><FieldError>{form.formState.errors.email?.message}</FieldError></Field><Field><FieldLabel htmlFor="invite-role">Role</FieldLabel><select id="invite-role" className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm" {...form.register("role")}><option value="Member">Member</option><option value="Admin">Admin</option></select></Field><DialogFooter className="-mx-6 -mb-5"><Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}><MailPlus className="h-4 w-4" />{form.formState.isSubmitting ? "Adding…" : "Add invitation"}</Button></DialogFooter></form></DialogContent></Dialog>
  </>;
}

export function InvitationsPage() {
  const invitations = useDemoStore((state) => state.invitations);
  const cancelInvitation = useDemoStore((state) => state.cancelInvitation);
  return <>
    <PageHeader eyebrow="Workspace administration" title="Invitations" description="A local preview of invitations created in the demo workspace." actions={<Link href="/app/team" className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold hover:bg-muted"><ChevronDown className="h-4 w-4 rotate-90" />Back to team</Link>} />
    <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/[.06] px-4 py-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">No emails are sent.</strong> Pending invites are sample data stored locally. Real invitation delivery and permissions are not implemented.</div>
    <Card><CardHeader><CardTitle>Pending invitations</CardTitle><p className="text-xs text-muted-foreground">{invitations.length} invitation{invitations.length === 1 ? "" : "s"}</p></CardHeader><CardContent className="p-0">{invitations.length ? <div className="divide-y divide-border">{invitations.map((invite) => <div key={invite.id} className="flex flex-wrap items-center gap-3 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><MailPlus className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{invite.email}</p><p className="mt-1 text-[10px] text-muted-foreground">Added {format(new Date(invite.sentAt), "MMM d, yyyy")} · {invite.role} role</p></div><Badge tone={invite.status === "pending" ? "warning" : "neutral"}>{invite.status}</Badge><Button variant="ghost" size="icon-sm" onClick={() => { cancelInvitation(invite.id); toast.success("Invitation removed from demo"); }} aria-label={`Cancel invitation for ${invite.email}`}><X className="h-4 w-4" /></Button></div>)}</div> : <div className="p-5"><EmptyState icon={MailPlus} title="No pending invitations" description="Invitations you create in demo mode will appear here." action={<Link href="/app/team" className="text-xs font-semibold text-primary">Invite a teammate</Link>} /></div>}</CardContent></Card>
  </>;
}
