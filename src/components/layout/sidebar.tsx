"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Archive, BarChart3, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ContactRound, Inbox, LayoutDashboard, Mail, PanelLeftClose, Send, Settings2, ShieldCheck, Star, Trash2, Users2, Workflow, Zap } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/stores/demo-store";

const primaryItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Inbox", href: "/app/inbox", icon: Inbox, count: "unread" },
  { label: "Sent", href: "/app/sent", icon: Send },
  { label: "Drafts", href: "/app/drafts", icon: Mail, count: "drafts" },
  { label: "Starred", href: "/app/starred", icon: Star },
  { label: "Archive", href: "/app/archive", icon: Archive },
  { label: "Trash", href: "/app/trash", icon: Trash2 },
];
const workspaceItems = [
  { label: "Domains", href: "/app/domains", icon: Workflow },
  { label: "Contacts", href: "/app/contacts", icon: ContactRound },
  { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { label: "Activity", href: "/app/activity", icon: Zap },
];

function NavLink({ item, collapsed, count, onNavigate }: { item: { label: string; href: string; icon: React.ElementType }; collapsed: boolean; count?: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = item.href === "/app" ? pathname === "/app" : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={cn("group flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", collapsed && "justify-center px-0")}>
      <Icon className={cn("h-[17px] w-[17px] shrink-0", active && "stroke-[2.25]")} />
      {!collapsed && <><span className="min-w-0 flex-1 truncate">{item.label}</span>{typeof count === "number" && count > 0 && <span className={cn("min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold", active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{count > 99 ? "99+" : count}</span>}</>}
      {collapsed && typeof count === "number" && count > 0 && <span className="absolute ml-5 mt-[-17px] h-2 w-2 rounded-full bg-primary ring-2 ring-card" />}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle, mobile = false, onNavigate }: { collapsed: boolean; onToggle?: () => void; mobile?: boolean; onNavigate?: () => void }) {
  const workspace = useDemoStore((state) => state.workspace);
  const emails = useDemoStore((state) => state.emails);
  const unread = emails.filter((email) => email.folder === "inbox" && !email.read).length;
  const drafts = emails.filter((email) => email.folder === "drafts").length;
  const displayCollapsed = collapsed && !mobile;
  return (
    <aside className={cn("flex h-full flex-col border-r border-border bg-card transition-[width] duration-200", displayCollapsed ? "w-[76px]" : "w-[252px]", mobile && "w-[286px]")}>
      <div className={cn("flex h-[68px] items-center border-b border-border px-5", displayCollapsed && "justify-center px-0")}>
        <Brand compact={displayCollapsed} href="/app" />
        {!displayCollapsed && <span className="ml-auto rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground">Demo</span>}
      </div>
      {!displayCollapsed && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="mx-3 mt-4 flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Workspace switcher. Current workspace: ${workspace.name}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-[11px] font-bold text-violet-600 dark:text-violet-300">NS</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{workspace.name}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">Demo workspace</span></span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="right" align="start" sideOffset={6} className="z-50 min-w-[220px] rounded-xl border border-border bg-card p-1.5 shadow-soft outline-none">
              <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground">Your workspaces</p>
              <DropdownMenu.Item onSelect={() => { onNavigate?.(); toast.info("Northstar Studio is the only workspace in this demo."); }} className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary outline-none">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-[9px] font-bold">NS</span>{workspace.name}<span className="ml-auto text-[9px]">Current</span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item onSelect={() => { onNavigate?.(); toast.info("Workspace creation is not available in this frontend demo."); }} className="cursor-pointer rounded-lg px-3 py-2 text-[10px] text-muted-foreground outline-none hover:bg-muted">+ Create workspace · demo only</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
      <nav aria-label="Main navigation" className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {!displayCollapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground/80">Workspace</p>}
          {primaryItems.map((item) => <NavLink key={item.href} item={item} collapsed={displayCollapsed} count={item.count === "unread" ? unread : item.count === "drafts" ? drafts : undefined} onNavigate={onNavigate} />)}
        </div>
        <div className="space-y-1">
          {!displayCollapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground/80">Manage</p>}
          {workspaceItems.map((item) => <NavLink key={item.href} item={item} collapsed={displayCollapsed} onNavigate={onNavigate} />)}
          <NavLink item={{ label: "Team", href: "/app/team", icon: Users2 }} collapsed={displayCollapsed} onNavigate={onNavigate} />
        </div>
        <div className="space-y-1">
          {!displayCollapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground/80">Preferences</p>}
          <NavLink item={{ label: "Settings", href: "/app/settings/profile", icon: Settings2 }} collapsed={displayCollapsed} onNavigate={onNavigate} />
          <NavLink item={{ label: "Demo admin", href: "/app/admin", icon: ShieldCheck }} collapsed={displayCollapsed} onNavigate={onNavigate} />
        </div>
      </nav>
      {!mobile && <div className="border-t border-border p-3">
        <a href="https://github.com/hieunc229/mailflare" target="_blank" rel="noreferrer" title={displayCollapsed ? "Reference project" : undefined} className={cn("flex h-9 items-center gap-3 rounded-lg px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground", displayCollapsed && "justify-center px-0")}>
          <CircleHelp className="h-4 w-4" />{!displayCollapsed && <span>Reference project</span>}
        </a>
        {onToggle && <button type="button" onClick={onToggle} aria-label={displayCollapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("mt-1 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground", displayCollapsed && "justify-center px-0")}>
          {displayCollapsed ? <ChevronRight className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span>Collapse sidebar</span><ChevronLeft className="ml-auto h-3.5 w-3.5" /></>}
        </button>}
      </div>}
      {mobile && <div className="border-t border-border px-5 py-3 text-[10px] text-muted-foreground">Mock data is stored in this browser.</div>}
    </aside>
  );
}
