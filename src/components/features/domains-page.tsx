"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Check, Ellipsis, Globe2, LoaderCircle, Plus, Search, ShieldCheck, Trash2, Workflow } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { domainSchema } from "@/lib/validation/schemas";
import { mockDomainService } from "@/lib/services/mock-services";
import { useDemoStore } from "@/stores/demo-store";
import type { Domain } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DomainForm = { domain: string };
type DomainFilter = "all" | "verified" | "pending" | "needs_attention";

export function DomainsPage() {
  const domains = useDemoStore((state) => state.domains);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DomainFilter>("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Domain | null>(null);
  const filtered = useMemo(() => domains.filter((domain) => (filter === "all" || domain.status === filter) && domain.name.toLowerCase().includes(search.toLowerCase().trim())), [domains, filter, search]);
  const deleteDomain = async () => {
    if (!removeTarget) return;
    await mockDomainService.remove(removeTarget.id);
    toast.success("Domain removed from the demo workspace", { description: "No DNS records or routing settings were changed." });
    setRemoveTarget(null);
  };

  return (
    <>
      <PageHeader eyebrow="Workspace settings" title="Domains" description="Explore a custom-domain setup flow and manage mock sender identities. No DNS is queried or changed." actions={<Button onClick={() => setWizardOpen(true)}><Plus className="h-4 w-4" />Add domain</Button>} />
      <div className="mb-5 grid gap-3 rounded-2xl border border-sky-500/15 bg-sky-500/[.04] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300"><ShieldCheck className="h-5 w-5" /></span>
        <div><p className="text-sm font-semibold">Domain setup is simulated</p><p className="mt-1 text-xs leading-5 text-muted-foreground">DNS values in this app are illustrative examples only. Use values from your actual email infrastructure for real DNS changes.</p></div>
        <Link href="/app/domains/domain-northstar" className="text-xs font-semibold text-primary hover:underline">Setup guide <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[310px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search domains" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search domains" className="h-10 pl-9" /></div>
        <div className="flex flex-wrap items-center gap-1.5">{(["all", "verified", "pending", "needs_attention"] as DomainFilter[]).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={cn("rounded-lg px-3 py-2 text-[11px] font-semibold capitalize transition", filter === value ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>{value === "needs_attention" ? "Needs attention" : value === "all" ? `All (${domains.length})` : value}</button>)}</div>
      </div>

      {filtered.length ? <div className="grid gap-4 xl:grid-cols-2">{filtered.map((domain) => <DomainCard key={domain.id} domain={domain} onRemove={() => setRemoveTarget(domain)} />)}</div> : <EmptyState icon={Workflow} title={domains.length ? "No matching domains" : "No domains connected yet"} description={domains.length ? "Try a different search or status filter." : "Add a domain to explore a frontend-only setup wizard."} action={domains.length ? <Button variant="secondary" size="sm" onClick={() => { setFilter("all"); setSearch(""); }}>Clear filters</Button> : <Button size="sm" onClick={() => setWizardOpen(true)}><Plus className="h-4 w-4" />Add domain</Button>} />}

      <DomainWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <Dialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove {removeTarget?.name}?</DialogTitle><DialogDescription>This only removes the domain from this browser demo. No Cloudflare or DNS configuration will be touched.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="secondary" onClick={() => setRemoveTarget(null)}>Keep domain</Button><Button variant="danger" onClick={deleteDomain}><Trash2 className="h-4 w-4" />Remove from demo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DomainCard({ domain, onRemove }: { domain: Domain; onRemove: () => void }) {
  const verified = domain.status === "verified";
  const copyDomain = async () => {
    try { await navigator.clipboard.writeText(domain.name); toast.success("Domain copied"); }
    catch { toast.error("Could not copy", { description: "Select and copy the domain name manually." }); }
  };
  return (
    <Card className="overflow-hidden transition hover:border-primary/20 hover:shadow-soft">
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", verified ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300")}><Globe2 className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/app/domains/${domain.id}`} className="truncate text-[15px] font-semibold tracking-[-.02em] hover:text-primary">{domain.name}</Link><Badge tone={verified ? "success" : "warning"}><span className={`h-1.5 w-1.5 rounded-full ${verified ? "bg-emerald-500" : "bg-amber-500"}`} />{verified ? "Ready" : "Setup pending"}</Badge></div><p className="mt-1.5 text-xs text-muted-foreground">Added {format(new Date(domain.createdAt), "MMM d, yyyy")} · {domain.provider} provider</p></div>
          <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${domain.name}`}><Ellipsis className="h-4 w-4" /></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={5} className="z-50 min-w-[170px] rounded-xl border border-border bg-card p-1 shadow-soft outline-none"><DropdownMenu.Item asChild><Link href={`/app/domains/${domain.id}`} className="cursor-pointer rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted">View setup</Link></DropdownMenu.Item><DropdownMenu.Item onSelect={() => void copyDomain()} className="cursor-pointer rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted">Copy domain name</DropdownMenu.Item><DropdownMenu.Separator className="my-1 h-px bg-border" /><DropdownMenu.Item onSelect={onRemove} className="cursor-pointer rounded-lg px-3 py-2 text-xs text-destructive outline-none hover:bg-destructive/5">Remove from demo</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border border-y border-border bg-muted/20">
          <div className="px-5 py-3.5 sm:px-6"><p className="text-[10px] font-medium uppercase tracking-[.08em] text-muted-foreground">Sender identities</p><p className="mt-1.5 text-sm font-semibold">{domain.mailboxCount} <span className="text-xs font-normal text-muted-foreground">configured</span></p></div>
          <div className="px-5 py-3.5 sm:px-6"><p className="text-[10px] font-medium uppercase tracking-[.08em] text-muted-foreground">DNS checklist</p><p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold">{domain.records.filter((record) => record.status === "verified").length}<span className="text-xs font-normal text-muted-foreground">of {domain.records.length} items</span></p></div>
        </div>
        <div className="flex items-center justify-between gap-3 p-4 sm:px-6"><div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"><span className={`h-2 w-2 rounded-full ${verified ? "bg-emerald-500" : "bg-amber-400"}`} />{verified ? "Setup marked complete in demo" : "Needs a simulated setup check"}</div><Link href={`/app/domains/${domain.id}`} className="shrink-0 text-xs font-semibold text-primary hover:underline">Manage <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
      </CardContent>
    </Card>
  );
}

function DomainWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [domainName, setDomainName] = useState("");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const form = useForm<DomainForm>({ resolver: zodResolver(domainSchema), defaultValues: { domain: "" }, mode: "onTouched" });

  const resetWizard = () => { setStep(1); setDomainName(""); setDomainId(null); setChecking(false); form.reset({ domain: "" }); };
  const close = (value: boolean) => { onOpenChange(value); if (!value) resetWizard(); };
  const nextFromDomain = async () => {
    const valid = await form.trigger("domain");
    if (!valid) return;
    const value = form.getValues("domain").trim().toLowerCase();
    if (useDemoStore.getState().domains.some((domain) => domain.name.toLowerCase() === value)) { form.setError("domain", { message: "That domain is already in your demo workspace." }); return; }
    setDomainName(value);
    setStep(2);
  };
  const createMockDomain = async () => {
    setChecking(true);
    try {
      const domain = await mockDomainService.add(domainName);
      setDomainId(domain.id);
      setStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add demo domain");
      setStep(1);
    } finally { setChecking(false); }
  };
  const simulateCheck = async () => {
    if (!domainId) return;
    setChecking(true);
    try { await mockDomainService.verify(domainId); setStep(5); toast.success("Setup marked complete in demo", { description: "No DNS or Cloudflare request was made." }); }
    catch { toast.error("The demo could not update this status. Please try again."); }
    finally { setChecking(false); }
  };
  const steps = ["Domain", "Setup", "Records", "Check"];

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-[min(94vw,640px)] p-0">
        <DialogHeader><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Workflow className="h-4 w-4" /></span><div><DialogTitle>{step === 5 ? "Domain added" : "Add a custom domain"}</DialogTitle><DialogDescription>{step === 5 ? "Your local setup walkthrough is complete." : "Walk through a frontend-only setup. No service is connected."}</DialogDescription></div></div></DialogHeader>
        {step < 5 && <div className="px-6 pt-5"><ol className="grid grid-cols-4 gap-2" aria-label="Domain setup steps">{steps.map((name, index) => <li key={name} className="flex flex-col gap-1.5"><span className={cn("h-1 rounded-full", index + 1 <= step ? "bg-primary" : "bg-muted")} /><span className={cn("text-[9px] font-semibold uppercase tracking-[.09em]", index + 1 === step ? "text-primary" : "text-muted-foreground")}>{index + 1}. {name}</span></li>)}</ol></div>}
        <div className="px-6 py-5">
          {step === 1 && <form onSubmit={(event) => { event.preventDefault(); void nextFromDomain(); }} className="space-y-5">
            <Field><FieldLabel htmlFor="domain">Domain name</FieldLabel><Input id="domain" autoFocus placeholder="yourdomain.com" autoComplete="off" {...form.register("domain")} /><FieldError>{form.formState.errors.domain?.message}</FieldError></Field>
            <div className="rounded-xl border border-border bg-muted/35 px-3.5 py-3 text-xs leading-5 text-muted-foreground">Use a domain you control in your real setup. For this walkthrough, any syntactically valid domain is accepted as local demo data.</div>
            <div className="flex justify-end"><Button type="submit">Continue<ArrowRight className="h-4 w-4" /></Button></div>
          </form>}
          {step === 2 && <div className="space-y-5">
            <div className="rounded-2xl border border-primary/20 bg-primary/[.035] p-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></span><div><p className="text-sm font-semibold">Cloudflare Email Routing walkthrough</p><p className="mt-1 text-xs leading-5 text-muted-foreground">In a real setup, your email provider supplies the exact DNS values for your domain. Mailflare can guide the process, but this demo does not read or write Cloudflare configuration.</p></div></div></div>
            <div className="space-y-2 text-xs"><p className="font-semibold">What the setup usually involves</p><ul className="space-y-2 text-muted-foreground"><li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" />Confirm where the domain’s DNS is managed.</li><li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" />Review provider-specific MX and sender-authentication records.</li><li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" />Verify each record with your email provider when configured.</li></ul></div>
            <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" />Back</Button><Button onClick={() => setStep(3)}>Review example records<ArrowRight className="h-4 w-4" /></Button></div>
          </div>}
          {step === 3 && <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[.08] p-3.5 text-xs leading-5 text-amber-900 dark:text-amber-200"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>Illustrative records only.</strong> These values use the reserved <code>example.invalid</code> domain and must not be copied into production DNS. Real values depend on your provider and domain.</span></div>
            <div className="overflow-hidden rounded-xl border border-border"><div className="grid grid-cols-[58px_1fr_1.35fr] gap-2 border-b border-border bg-muted/50 px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground"><span>Type</span><span>Name</span><span>Example value</span></div>
              {[{ type: "MX", name: "@", value: "mx.example.invalid" }, { type: "TXT", name: "@", value: '"v=spf1 include:mail.example.invalid ~all"' }, { type: "CNAME", name: "demo._domainkey", value: "demo-key.example.invalid" }, { type: "TXT", name: "_dmarc", value: '"v=DMARC1; p=none; …"' }].map((record) => <div key={record.type + record.name} className="grid grid-cols-[58px_1fr_1.35fr] gap-2 border-b border-border/70 px-3 py-2.5 text-[10px] last:border-b-0"><span className="font-bold text-primary">{record.type}</span><span className="truncate font-medium">{record.name}</span><code className="truncate text-muted-foreground">{record.value}</code></div>)}</div>
            <p className="text-[10px] leading-5 text-muted-foreground">Example values are not returned by a real provider or integration. SPF, DKIM, and DMARC must match your chosen sending service.</p>
            <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" />Back</Button><Button disabled={checking} onClick={() => void createMockDomain()}>{checking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add to demo workspace</Button></div>
          </div>}
          {step === 4 && <div className="space-y-5 py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><LoaderCircle className="h-7 w-7" /></div>
            <div className="text-center"><h3 className="text-base font-semibold">Ready to simulate verification</h3><p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">{domainName} has been added with pending example records. The button below changes only the local demo state—it does not query DNS or Cloudflare.</p></div>
            <div className="rounded-xl border border-border bg-muted/25 p-3 text-center text-xs font-medium">{domainName}<span className="ml-2 text-muted-foreground">· pending</span></div>
            <div className="flex justify-end"><Button disabled={checking} onClick={() => void simulateCheck()}>{checking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Simulate verification</Button></div>
          </div>}
          {step === 5 && <div className="space-y-5 py-3 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><Check className="h-7 w-7" /></span><div><h3 className="text-base font-semibold">{domainName} is ready in your demo</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">The setup status and example DNS rows were updated in local browser state. No records were verified in the real world.</p></div><div className="flex justify-center gap-2"><Button variant="secondary" onClick={() => close(false)}>Close</Button><Button onClick={() => { close(false); if (domainId) router.push(`/app/domains/${domainId}`); }}>View domain<ArrowRight className="h-4 w-4" /></Button></div>
          </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

