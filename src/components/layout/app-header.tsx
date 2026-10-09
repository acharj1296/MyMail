"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, Command, LogOut, Menu, Moon, Search, Settings, Sun, UserRound, X } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/stores/demo-store";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/app": "Overview", "/app/inbox": "Inbox", "/app/sent": "Sent", "/app/drafts": "Drafts", "/app/starred": "Starred", "/app/archive": "Archive", "/app/trash": "Trash", "/app/compose": "Compose message", "/app/domains": "Domains", "/app/contacts": "Contacts", "/app/analytics": "Analytics", "/app/activity": "Activity", "/app/settings": "Settings", "/app/team": "Team", "/app/admin": "Demo admin",
};

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useDemoStore((state) => state.user);
  const preferences = useDemoStore((state) => state.preferences);
  const updatePreferences = useDemoStore((state) => state.updatePreferences);
  const signOut = useDemoStore((state) => state.signOut);
  const notifications = useDemoStore((state) => state.notifications);
  const markNotificationRead = useDemoStore((state) => state.markNotificationRead);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState(false);
  const title = useMemo(() => {
    if (titles[pathname]) return titles[pathname];
    if (pathname.startsWith("/app/domains/")) return "Domain details";
    if (pathname.startsWith("/app/settings/")) return "Settings";
    if (pathname.startsWith("/app/team/")) return "Invitations";
    return "Workspace";
  }, [pathname]);
  const unreadNotices = notifications.filter((notice) => !notice.read).length;
  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = search.trim();
    if (!term) { setSearchError(true); return; }
    setSearchError(false);
    setSearchOpen(false);
    router.push(`/app/inbox?search=${encodeURIComponent(term)}`);
  };
  const toggleTheme = () => updatePreferences({ theme: preferences.theme === "dark" ? "light" : "dark" });

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold tracking-[-.02em] sm:text-[15px]">{title}</h1>
            <span className="hidden items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-emerald-700 dark:text-emerald-400 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Demo</span>
          </div>
          <p className="hidden text-[11px] text-muted-foreground sm:block">Your custom-domain email workspace</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <form onSubmit={onSearch} className={cn("relative hidden items-center lg:flex", searchOpen && "flex") }>
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setSearchError(false); }} placeholder="Search mail…" aria-label="Search mail" className={cn("h-9 w-[190px] rounded-lg border-transparent bg-muted/75 pl-9 pr-12 text-xs focus:bg-card xl:w-[230px]", searchError && "border-destructive")} />
          <span className="pointer-events-none absolute right-2.5 inline-flex items-center gap-0.5 rounded border border-border bg-card px-1 py-0.5 text-[9px] text-muted-foreground"><Command className="h-2.5 w-2.5" />K</span>
        </form>
        <Button variant="primary" size="sm" className="hidden h-9 rounded-lg px-3 text-xs sm:inline-flex" onClick={() => router.push("/app/compose")}><span className="text-[15px] leading-none">+</span><span>Compose</span></Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={() => setSearchOpen((v) => !v)} aria-label={searchOpen ? "Close search" : "Search mail"}>{searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}</Button>
        <Button variant="ghost" size="icon" className="hidden h-9 w-9 sm:inline-flex" onClick={toggleTheme} aria-label={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} theme`}>{preferences.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={`Notifications${unreadNotices ? `, ${unreadNotices} unread` : ""}`}>
              <Bell className="h-[17px] w-[17px]" />{unreadNotices > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-card bg-rose-500" />}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={9} className="z-50 w-[min(340px,calc(100vw-24px))] rounded-2xl border border-border bg-card p-1.5 shadow-soft outline-none">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5"><span className="text-sm font-semibold">Notifications</span><span className="text-[10px] text-muted-foreground">Demo activity</span></div>
              {notifications.slice(0, 4).map((notice) => <DropdownMenu.Item key={notice.id} onSelect={() => markNotificationRead(notice.id)} className="flex cursor-pointer gap-3 rounded-xl px-3 py-3 outline-none transition hover:bg-muted data-[highlighted]:bg-muted">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", notice.read ? "bg-transparent" : "bg-primary")} />
                <span className="min-w-0"><span className="block text-xs font-semibold">{notice.title}</span><span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{notice.description}</span></span>
              </DropdownMenu.Item>)}
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild><Link href="/app/activity" className="block rounded-lg px-3 py-2 text-center text-xs font-semibold text-primary outline-none hover:bg-muted">View activity</Link></DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="ml-1 flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open profile menu">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500 text-[11px] font-bold text-white">{initials(user.name)}</span>
              <span className="hidden max-w-[100px] text-left sm:block"><span className="block truncate text-xs font-semibold">{user.name}</span><span className="block truncate text-[10px] text-muted-foreground">Owner</span></span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-soft outline-none">
              <div className="px-3 py-2"><p className="text-xs font-semibold">{user.name}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{user.email}</p></div>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild><Link href="/app/settings/profile" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted"><UserRound className="h-3.5 w-3.5" /> Profile settings</Link></DropdownMenu.Item>
              <DropdownMenu.Item asChild><Link href="/app/settings/appearance" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs outline-none hover:bg-muted"><Settings className="h-3.5 w-3.5" /> Preferences</Link></DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item onSelect={() => { signOut(); router.push("/login"); }} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive outline-none hover:bg-destructive/5"><LogOut className="h-3.5 w-3.5" /> Sign out of demo</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      {searchError && <p className="absolute right-5 top-[58px] rounded-lg border border-destructive/20 bg-card px-3 py-2 text-xs text-destructive shadow-card">Enter a search term.</p>}
      {searchOpen && <form onSubmit={onSearch} className="absolute left-0 right-0 top-[68px] z-40 flex gap-2 border-b border-border bg-card p-3 lg:hidden"><Input autoFocus value={search} onChange={(e) => { setSearch(e.target.value); setSearchError(false); }} placeholder="Search inbox…" aria-label="Search inbox" className="h-10" /><Button type="submit" size="sm">Search</Button></form>}
    </header>
  );
}
