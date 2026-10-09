"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, CalendarDays, Inbox, MailCheck, ShieldCheck, UsersRound } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/features/stat-card";
import { useDemoStore } from "@/stores/demo-store";

const week = [
  { day: "Oct 3", received: 18, sent: 8, unread: 5 }, { day: "Oct 4", received: 24, sent: 12, unread: 7 }, { day: "Oct 5", received: 15, sent: 9, unread: 4 },
  { day: "Oct 6", received: 31, sent: 16, unread: 8 }, { day: "Oct 7", received: 26, sent: 13, unread: 6 }, { day: "Oct 8", received: 38, sent: 20, unread: 10 }, { day: "Oct 9", received: 29, sent: 17, unread: 7 },
];
const month = Array.from({ length: 30 }, (_, index) => ({ day: `Oct ${index + 1}`, received: 12 + (index * 7) % 24, sent: 5 + (index * 5) % 16, unread: 2 + (index * 3) % 9 }));
const rangeOptions = ["7 days", "30 days", "90 days"] as const;

export function AnalyticsPage() {
  const emails = useDemoStore((state) => state.emails);
  const domains = useDemoStore((state) => state.domains);
  const activities = useDemoStore((state) => state.activities);
  const contacts = useDemoStore((state) => state.contacts);
  const [range, setRange] = useState<(typeof rangeOptions)[number]>("7 days");
  const chartData = useMemo(() => range === "7 days" ? week : range === "30 days" ? month : Array.from({ length: 12 }, (_, index) => ({ day: `Week ${index + 1}`, received: 82 + (index * 13) % 59, sent: 32 + (index * 9) % 35, unread: 12 + (index * 5) % 23 })), [range]);
  const inboxCount = emails.filter((email) => email.folder === "inbox").length;
  const sentCount = emails.filter((email) => email.folder === "sent").length;
  const unread = emails.filter((email) => email.folder === "inbox" && !email.read).length;
  const domainData = [{ name: "Ready", value: domains.filter((domain) => domain.status === "verified").length }, { name: "Pending", value: domains.filter((domain) => domain.status !== "verified").length }];
  const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 11 };

  return (
    <>
      <PageHeader eyebrow="Insights" title="Analytics" description="Illustrative workspace activity, not delivery or provider analytics." actions={<div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1"><CalendarDays className="ml-2 h-4 w-4 text-muted-foreground" />{rangeOptions.map((option) => <button type="button" key={option} onClick={() => setRange(option)} className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${range === option ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{option}</button>)}</div>} />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/[.05] px-4 py-3.5"><Activity className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" /><p className="text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Demo analytics.</strong> Charts use deterministic sample data and local mock state. No actual email delivery, receiving, opens, or clicks are measured.</p><Badge tone="primary" className="ml-auto hidden sm:inline-flex">{range}</Badge></div>
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Inbox messages" value={inboxCount} note="sample messages" icon={Inbox} tone="violet" trend="up" />
        <StatCard label="Sent in demo" value={sentCount} note="not delivered" icon={MailCheck} tone="blue" />
        <StatCard label="Unread now" value={unread} note="current sample state" icon={ArrowDownRight} tone="amber" />
        <StatCard label="Domain setup" value={`${domains.filter((domain) => domain.status === "verified").length}/${domains.length}`} note="local checklist status" icon={ShieldCheck} tone="green" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.8fr)]">
        <Card className="min-w-0"><CardHeader className="flex-row items-start justify-between"><div><CardTitle>Messages over time</CardTitle><p className="mt-1 text-xs text-muted-foreground">Mock counts by {range === "90 days" ? "week" : "day"}</p></div><span className="rounded-lg bg-primary/10 p-2 text-primary"><ArrowUpRight className="h-4 w-4" /></span></CardHeader><CardContent className="h-[290px] pt-3"><div className="h-full w-full" role="img" aria-label={`Sample received and sent message counts for ${range}`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="analyticsReceived" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7165df" stopOpacity={.2} /><stop offset="100%" stopColor="#7165df" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={range === "30 days" ? 4 : 0} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }} /><Area type="monotone" dataKey="received" name="Received · sample" stroke="#7165df" fill="url(#analyticsReceived)" strokeWidth={2} /><Area type="monotone" dataKey="sent" name="Sent · demo" stroke="#38bdf8" fill="#38bdf8" fillOpacity={.06} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></CardContent></Card>
        <Card className="min-w-0"><CardHeader><CardTitle>Domain setup status</CardTitle><p className="text-xs text-muted-foreground">Local checklist states only</p></CardHeader><CardContent className="h-[290px] pt-3"><div className="h-full w-full" role="img" aria-label="Bar chart summarizing local demo domain status"><ResponsiveContainer width="100%" height="100%"><BarChart data={domainData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" name="Domains · demo" radius={[7, 7, 0, 0]} fill="#7165df" /></BarChart></ResponsiveContainer></div></CardContent></Card>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
        <Card className="min-w-0"><CardHeader><CardTitle>Unread trend</CardTitle><p className="text-xs text-muted-foreground">Illustrative unread counts; local inbox state: {unread}</p></CardHeader><CardContent className="h-[230px] pt-2"><div className="h-full w-full" role="img" aria-label={`Demo unread message trend for ${range}`}><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={range === "30 days" ? 4 : 0} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="unread" name="Unread · sample" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Workspace signals</CardTitle><p className="text-xs text-muted-foreground">Sample account activity</p></CardHeader><CardContent className="space-y-3">{[{ label: "Activity events", value: activities.length, icon: Activity }, { label: "Contacts", value: contacts.length, icon: UsersRound }, { label: "Connected domains", value: domains.length, icon: ShieldCheck }].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 rounded-xl border border-border/75 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></span><span className="flex-1 text-xs font-medium">{label}</span><span className="text-sm font-semibold">{value}</span></div>)}<p className="pt-2 text-[10px] leading-5 text-muted-foreground">Use Analytics to preview interaction patterns; future real metrics need a connected backend and provider telemetry.</p></CardContent></Card>
      </section>
    </>
  );
}
