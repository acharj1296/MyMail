"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CirclePlus, ContactRound, Inbox, MailPlus, MessageCircleMore, Plus, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/features/stat-card";
import { ActivityChart } from "@/components/features/activity-chart";
import { initials } from "@/lib/utils";

export function DashboardPage() {
  const user = useDemoStore((state) => state.user);
  const router = useRouter();
  const emails = useDemoStore((state) => state.emails);
  const domains = useDemoStore((state) => state.domains);
  const activities = useDemoStore((state) => state.activities);
  const inbox = emails.filter((email) => email.folder === "inbox");
  const unread = inbox.filter((email) => !email.read).length;
  const sentCount = emails.filter((email) => email.folder === "sent").length;
  const verifiedDomains = domains.filter((domain) => domain.status === "verified").length;
  const recentMessages = inbox.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const checklist = [
    { title: "Explore your inbox", done: inbox.length > 0, href: "/app/inbox", icon: Inbox },
    { title: "Connect a custom domain", done: domains.length > 0, href: "/app/domains", icon: Workflow },
    { title: "Add your first contact", done: false, href: "/app/contacts", icon: ContactRound },
  ];

  return (
    <>
      <PageHeader eyebrow="Friday, October 9 · Demo workspace" title={`Good morning, ${user.name.split(" ")[0]}`} description="A clear view of your domains, messages, and the little things that need attention." actions={<Button onClick={() => router.push("/app/compose")}><MailPlus className="h-4 w-4" />Compose email</Button>} />
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.045] px-4 py-3.5 text-sm">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="font-semibold">You’re exploring a frontend demo</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">Numbers, inbox events, domain checks, and message sending are simulated and stored only in this browser.</p></div><Badge tone="primary" className="ml-auto hidden shrink-0 sm:inline-flex">Local data</Badge>
      </div>
      <section aria-label="Workspace overview metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Inbox messages" value={inbox.length} note="sample messages" icon={Inbox} tone="violet" trend="up" />
        <StatCard label="Unread" value={unread} note="need a look" icon={MessageCircleMore} tone="blue" />
        <StatCard label="Sent in demo" value={sentCount} note="nothing delivered" icon={ArrowUpRight} tone="green" />
        <StatCard label="Ready domains" value={verifiedDomains} note={`${domains.length} connected in demo`} icon={ShieldCheck} tone="amber" />
      </section>

      <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.62fr)_minmax(310px,.9fr)]">
        <ActivityChart />
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3"><div><CardTitle>Setup checklist</CardTitle><p className="mt-1 text-xs text-muted-foreground">A few useful places to start</p></div><span className="rounded-lg bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></span></CardHeader>
          <CardContent className="space-y-2">
            {checklist.map((item) => <Link key={item.title} href={item.href} className="group flex items-center gap-3 rounded-xl border border-border/70 px-3 py-3 transition hover:border-primary/20 hover:bg-muted/45">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{item.done ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}</span>
              <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{item.title}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{item.done ? "Done in this demo" : "Takes about a minute"}</span></span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>)}
            <p className="pt-2 text-[10px] leading-5 text-muted-foreground">Demo setup status is local UI state; no DNS or Cloudflare checks are made.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(310px,.8fr)]">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3"><div><CardTitle>Recent messages</CardTitle><p className="mt-1 text-xs text-muted-foreground">A snapshot of your sample inbox</p></div><Link href="/app/inbox" className="text-xs font-semibold text-primary hover:underline">Open inbox <ArrowRight className="ml-1 inline h-3 w-3" /></Link></CardHeader>
          {recentMessages.length ? <div className="px-2 pb-2 sm:px-3">{recentMessages.map((message) => <Link href={`/app/inbox?open=${encodeURIComponent(message.id)}`} key={message.id} className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-muted/60">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-300">{initials(message.from.name)}</span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className={`truncate text-xs ${message.read ? "font-medium" : "font-bold"}`}>{message.from.name}</span>{message.starred && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}</span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{message.subject} <span className="text-muted-foreground/70">— {message.preview}</span></span></span>
            <span className="shrink-0 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(message.date), { addSuffix: true })}</span>
          </Link>)}</div> : <div className="p-5"><EmptyState icon={Inbox} title="Your inbox is quiet" description="Sample messages will appear here when you have email in your demo workspace." /></div>}
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3"><div><CardTitle>Your domains</CardTitle><p className="mt-1 text-xs text-muted-foreground">Setup status in this workspace</p></div><Link href="/app/domains" aria-label="View all domains" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><ArrowRight className="h-4 w-4" /></Link></CardHeader>
          <CardContent className="space-y-3">
            {domains.length ? domains.slice(0, 3).map((domain) => <Link href={`/app/domains/${domain.id}`} key={domain.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:bg-muted/45">
              <span className={`h-2 w-2 rounded-full ${domain.status === "verified" ? "bg-emerald-500" : "bg-amber-400"}`} />
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{domain.name}</span><span className="mt-1 block text-[10px] text-muted-foreground">{domain.mailboxCount} sender identities</span></span>
              <Badge tone={domain.status === "verified" ? "success" : "warning"}>{domain.status === "verified" ? "Ready" : "Setup"}</Badge>
            </Link>) : <EmptyState icon={Workflow} title="No domains yet" description="Add a domain to explore the setup flow." action={<Link href="/app/domains" className="text-xs font-semibold text-primary">Add a domain</Link>} />}
            <Link href="/app/domains" className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary"><Plus className="h-4 w-4" /> Manage domains</Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle><p className="text-xs text-muted-foreground">A few common next steps</p></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {[{ label: "Write a message", detail: "Open the demo composer", href: "/app/compose", icon: MailPlus }, { label: "Add a domain", detail: "Walk through setup", href: "/app/domains", icon: CirclePlus }, { label: "Find a contact", detail: "Keep people organized", href: "/app/contacts", icon: ContactRound }, { label: "View analytics", detail: "Explore sample trends", href: "/app/analytics", icon: ArrowUpRight }].map(({ label, detail, href, icon: Icon }) => <Link key={href} href={href} className="rounded-xl border border-border/75 p-3 transition hover:border-primary/25 hover:bg-primary/[.025]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></span><span className="mt-3 block text-xs font-semibold">{label}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{detail}</span></Link>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2"><div><CardTitle>Recent activity</CardTitle><p className="mt-1 text-xs text-muted-foreground">Local activity log</p></div><Link href="/app/activity" className="text-xs font-semibold text-primary hover:underline">See all</Link></CardHeader>
          <CardContent className="space-y-4 pt-2">{activities.slice(0, 4).map((activity, index) => <div key={activity.id} className="flex gap-3"><div className="flex flex-col items-center"><span className={`mt-1.5 h-2 w-2 rounded-full ${index === 0 ? "bg-primary" : "bg-border"}`} />{index !== 3 && <span className="mt-1 h-full w-px bg-border" />}</div><div className="min-w-0 flex-1 pb-1"><p className="text-xs font-semibold">{activity.title}</p><p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{activity.description}</p></div><span className="shrink-0 pt-0.5 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</span></div>)}</CardContent>
        </Card>
      </section>
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-[11px] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /><span>Product preview inspired by Mailflare’s open-source custom-domain inbox. This demo does not connect to email infrastructure.</span><Link href="/app/admin" className="ml-auto shrink-0 font-semibold text-primary">Demo details <ChevronRight className="ml-0.5 inline h-3 w-3" /></Link></div>
    </>
  );
}
