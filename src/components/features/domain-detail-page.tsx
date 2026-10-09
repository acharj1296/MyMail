"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, ExternalLink, Globe2, Mail, ShieldCheck, Trash2, TriangleAlert, Workflow } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { toast } from "sonner";
import { useDemoStore } from "@/stores/demo-store";
import { mockDomainService } from "@/lib/services/mock-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export function DomainDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const domains = useDemoStore((state) => state.domains);
  const activities = useDemoStore((state) => state.activities);
  const domain = domains.find((item) => item.id === params.id);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  if (!domain) return <><PageHeader title="Domain not found" description="This domain does not exist in the current demo workspace." actions={<Button variant="secondary" onClick={() => router.push("/app/domains")}><ArrowLeft className="h-4 w-4" />Back to domains</Button>} /><EmptyState icon={Globe2} title="We couldn’t find that domain" description="It may have been removed or the URL may be incorrect." action={<Link href="/app/domains" className="text-xs font-semibold text-primary">Return to domains</Link>} /></>;
  const verified = domain.status === "verified";
  const verify = async () => {
    setChecking(true);
    try { await mockDomainService.verify(domain.id); toast.success("Demo status updated", { description: "No DNS or Cloudflare lookup was performed." }); }
    catch { toast.error("The demo status could not be updated."); }
    finally { setChecking(false); }
  };
  const remove = async () => {
    await mockDomainService.remove(domain.id);
    toast.success("Domain removed from local demo state");
    router.push("/app/domains");
  };
  const activityForDomain = activities.filter((event) => event.kind === "domain").slice(0, 3);

  return (
    <>
      <PageHeader eyebrow="Domain management" title={domain.name} description="Review mock DNS examples, sender identities, and simulated setup progress." actions={<><Button variant="secondary" onClick={() => router.push("/app/domains")}><ArrowLeft className="h-4 w-4" />All domains</Button><Button variant="secondary" onClick={() => setRemoveOpen(true)}><Trash2 className="h-4 w-4" />Remove</Button></>} />
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[.08] p-4 sm:items-center sm:p-5"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" /><div><p className="text-sm font-semibold">Demo setup only — not production DNS</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The record values below are examples reserved for documentation. Use the values supplied by your actual mail provider. This app does not connect to Cloudflare or verify DNS.</p></div><Badge tone="warning" className="ml-auto hidden shrink-0 sm:inline-flex">Illustrative</Badge></div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
        <div className="space-y-5">
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Domain overview</CardTitle><p className="mt-1 text-xs text-muted-foreground">Added {format(new Date(domain.createdAt), "MMM d, yyyy")}</p></div><Badge tone={verified ? "success" : "warning"}><span className={`h-1.5 w-1.5 rounded-full ${verified ? "bg-emerald-500" : "bg-amber-500"}`} />{verified ? "Ready in demo" : "Setup pending"}</Badge></CardHeader><CardContent className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3"><div><p className="text-[10px] font-bold uppercase tracking-[.09em] text-muted-foreground">Provider</p><p className="mt-1.5 text-sm font-semibold">{domain.provider}</p><p className="mt-1 text-[10px] text-muted-foreground">Example configuration only</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.09em] text-muted-foreground">Sender identities</p><p className="mt-1.5 text-sm font-semibold">{domain.mailboxCount}</p><p className="mt-1 text-[10px] text-muted-foreground">Local mock identities</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.09em] text-muted-foreground">DNS checklist</p><p className="mt-1.5 text-sm font-semibold">{domain.records.filter((record) => record.status === "verified").length} / {domain.records.length}</p><p className="mt-1 text-[10px] text-muted-foreground">No lookup was performed</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Workflow className="h-4 w-4 text-primary" />DNS record examples</CardTitle><p className="text-xs leading-5 text-muted-foreground">Copy is supported for convenience, but these examples must not be entered into a live zone.</p></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-y border-border bg-muted/30 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground"><th className="px-5 py-3">Type</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Value</th><th className="px-3 py-3">Priority</th><th className="px-3 py-3">Status</th><th className="px-5 py-3 text-right">Copy</th></tr></thead><tbody>{domain.records.map((record) => <tr key={record.id} className="border-b border-border/70 text-[11px] last:border-0"><td className="px-5 py-3.5 font-bold text-primary">{record.type}</td><td className="px-3 py-3.5 font-medium">{record.name}</td><td className="max-w-[200px] px-3 py-3.5"><code className="block truncate rounded bg-muted/60 px-1.5 py-1 text-[10px]" title={record.value}>{record.value}</code><span className="mt-1 block text-[9px] text-muted-foreground">{record.purpose}</span></td><td className="px-3 py-3.5 text-muted-foreground">{record.priority ?? "—"}</td><td className="px-3 py-3.5"><Badge tone={record.status === "verified" ? "success" : "warning"}>{record.status === "verified" ? "Demo OK" : "Pending"}</Badge></td><td className="px-5 py-3.5 text-right"><CopyButton value={`${record.type} ${record.name} ${record.value}`} /></td></tr>)}</tbody></table></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Cloudflare Email Routing setup</CardTitle><p className="text-xs text-muted-foreground">A practical outline, not a live integration.</p></CardHeader><CardContent className="space-y-3">
            <SetupStep number="1" title="Confirm DNS provider" text="Check that you can manage DNS for the domain and note any existing mail records before making changes." done={verified} />
            <SetupStep number="2" title="Enable the receiving route" text="Follow the current Cloudflare Email Routing instructions for your account. MX targets vary by service and zone." done={verified} />
            <SetupStep number="3" title="Set sender authentication" text="Use the exact SPF, DKIM, and DMARC guidance from your chosen outbound mail provider. Do not copy this demo’s example values." done={verified} />
            <SetupStep number="4" title="Verify with the provider" text="Confirm DNS propagation and provider status from the actual service before relying on mail delivery." done={verified} />
            <div className="flex flex-wrap gap-2 pt-2"><Button disabled={checking || verified} onClick={() => void verify()}>{checking ? "Updating demo…" : verified ? <><Check className="h-4 w-4" />Marked complete</> : <><ShieldCheck className="h-4 w-4" />Simulate setup complete</>}</Button><a href="https://developers.cloudflare.com/email-routing/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:bg-muted">Cloudflare guide<ExternalLink className="h-3.5 w-3.5" /></a></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Troubleshooting and DNS guidance</CardTitle><p className="text-xs text-muted-foreground">General reminders; verify current provider documentation.</p></CardHeader><CardContent><Accordion.Root type="single" collapsible className="divide-y divide-border">{[
            { title: "Why does the MX value look unusual?", body: "The MX host shown here is a placeholder using example.invalid. Actual targets are provider- and domain-specific. Do not use it in live DNS." },
            { title: "Do I need SPF, DKIM, and DMARC?", body: "Email authentication records depend on how you send mail. Follow your sending provider’s current instructions and avoid creating conflicting SPF records." },
            { title: "What does ‘Simulate setup complete’ mean?", body: "It only changes a badge in this browser. There is no DNS query, Cloudflare API call, or delivery check behind that control." },
          ].map((item, index) => <Accordion.Item key={item.title} value={`item-${index}`}><Accordion.Header><Accordion.Trigger className="flex w-full items-center justify-between py-3 text-left text-xs font-semibold hover:text-primary">{item.title}<ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" /></Accordion.Trigger></Accordion.Header><Accordion.Content className="pb-3 text-xs leading-5 text-muted-foreground">{item.body}</Accordion.Content></Accordion.Item>)}</Accordion.Root></CardContent></Card>
        </div>
        <div className="space-y-5">
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Sender identities</CardTitle><p className="mt-1 text-xs text-muted-foreground">Mock mailboxes for this domain</p></div><Mail className="h-4 w-4 text-primary" /></CardHeader><CardContent className="space-y-2.5">
            {domain.identities.length ? domain.identities.map((identity) => <div key={identity} className="flex items-center gap-3 rounded-xl border border-border/80 px-3 py-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{identity}</span><span className="block text-[10px] text-muted-foreground">Sender identity · demo</span></span><Badge>Active</Badge></div>) : <EmptyState icon={Mail} title="No senders yet" description="Mock identities will show up here after configuration." className="min-h-[175px]" />}
            <p className="pt-1 text-[10px] leading-5 text-muted-foreground">Mailbox creation and actual inbound or outbound email are not enabled in this frontend.</p>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Recent domain activity</CardTitle><p className="text-xs text-muted-foreground">Status events are local demo records</p></CardHeader><CardContent className="space-y-4">{activityForDomain.length ? activityForDomain.map((event) => <div key={event.id} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{event.title}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{event.description}</p></div><time className="shrink-0 text-[9px] text-muted-foreground">{format(new Date(event.date), "MMM d")}</time></div>) : <p className="text-xs text-muted-foreground">No recent activity.</p>}</CardContent></Card>
          <Card className="border-primary/15 bg-primary/[.035]"><CardContent className="p-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Globe2 className="h-4 w-4" /></div><h3 className="mt-3 text-sm font-semibold">Keep this demo safe</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Example DNS values are intentionally nonfunctional. For a production setup, use the provider-specific values in your real account.</p><Link href="/app/domains" className="mt-3 inline-flex items-center text-xs font-semibold text-primary">Back to domains<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></CardContent></Card>
        </div>
      </div>
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}><DialogContent><DialogHeader><DialogTitle>Remove {domain.name}?</DialogTitle><DialogDescription>This removes only local mock data. No records will be deleted from any DNS provider.</DialogDescription></DialogHeader><DialogFooter><Button variant="secondary" onClick={() => setRemoveOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => void remove()}><Trash2 className="h-4 w-4" />Remove domain</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}

function SetupStep({ number, title, text, done }: { number: string; title: string; text: string; done: boolean }) {
  return <div className="flex gap-3 rounded-xl border border-border/75 px-3.5 py-3"><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{done ? <Check className="h-3.5 w-3.5" /> : number}</span><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{text}</p></div></div>;
}

function CopyButton({ value }: { value: string }) {
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard is unavailable");
      await navigator.clipboard.writeText(value);
      toast.success("Record copied", { description: "Illustrative value only—do not use in production DNS." });
    } catch {
      toast.error("Could not copy record", { description: "Select the record value and copy it manually." });
    }
  };
  return <Button variant="ghost" size="icon-sm" onClick={() => void copy()} aria-label="Copy record example"><Copy className="h-3.5 w-3.5" /></Button>;
}
