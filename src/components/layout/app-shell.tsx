"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1920px]">
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} /></div>
        {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><div className="relative h-full"><Sidebar collapsed={false} mobile onNavigate={() => setMobileOpen(false)} /></div></div>}
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onMenuClick={() => setMobileOpen(true)} />
          <main key={pathname} className={cn("page-content mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9", "animate-fade-up")}>
            {children}
          </main>
          <footer className="border-t border-border/80 px-4 py-3 text-center text-[10px] text-muted-foreground sm:px-6 lg:px-9">Demo workspace · Local mock data only · No mail is sent and no DNS is checked</footer>
        </div>
      </div>
    </div>
  );
}
