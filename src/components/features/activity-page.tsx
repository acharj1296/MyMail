"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Activity, CalendarDays, ChevronDown, ContactRound, Globe2, Mail, Search, ShieldCheck, UsersRound } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDemoStore } from "@/stores/demo-store";
import type { ActivityEvent } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const kindMeta: Record<ActivityEvent["kind"], { icon: typeof Mail; label: string; tone: string }> = {
  email: { icon: Mail, label: "Email", tone: "bg-primary/10 text-primary" },
  domain: { icon: Globe2, label: "Domain", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
  contact: { icon: ContactRound, label: "Contact", tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  account: { icon: ShieldCheck, label: "Account", tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
  team: { icon: UsersRound, label: "Team", tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300" },
};

export function ActivityPage() {
  const activities = useDemoStore((state) => state.activities);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => activities.filter((event) => (filter === "all" || event.kind === filter) && `${event.title} ${event.description} ${event.actor}`.toLowerCase().includes(search.trim().toLowerCase())), [activities, filter, search]);
  return <>
    <PageHeader eyebrow="Workspace history" title="Activity" description="A local timeline of actions in your demo workspace." actions={<Badge tone="primary"><CalendarDays className="h-3 w-3" />Demo log</Badge>} />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-[310px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity" aria-label="Search activity" className="h-10 pl-9" /></div><DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="secondary" size="sm" className="justify-between"><span className="capitalize">{filter === "all" ? "All activity" : filter}</span><ChevronDown className="h-3.5 w-3.5" /></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" className="z-50 rounded-xl border border-border bg-card p-1 shadow-soft outline-none">{["all", "email", "domain", "contact", "account", "team"].map((item) => <DropdownMenu.Item key={item} onSelect={() => setFilter(item)} className="cursor-pointer rounded-lg px-3 py-2 text-xs capitalize outline-none hover:bg-muted">{item === "all" ? "All activity" : item}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div>
    {visible.length ? <Card className="overflow-hidden"><div className="divide-y divide-border/75">{visible.map((event) => { const meta = kindMeta[event.kind]; const Icon = meta.icon; return <div key={event.id} className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-6"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta.tone)}><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold">{event.title}</p><Badge>{meta.label}</Badge></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{event.description}</p><p className="mt-2 text-[10px] text-muted-foreground">By {event.actor}</p></div><time className="shrink-0 text-right text-[10px] text-muted-foreground" dateTime={event.date} title={format(new Date(event.date), "PPpp")}>{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</time></div>; })}</div><div className="border-t border-border bg-muted/20 px-5 py-3 text-[10px] text-muted-foreground">{visible.length} local events · No backend audit log is connected</div></Card> : <EmptyState icon={Activity} title={activities.length ? "No activity found" : "No activity yet"} description={activities.length ? "Try clearing your search or selecting another activity type." : "Actions in the demo workspace will appear here."} action={activities.length ? <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</Button> : undefined} />}
  </>;
}
