import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, note, trend, icon: Icon, tone = "violet" }: { label: string; value: string | number; note: string; trend?: "up" | "down"; icon: LucideIcon; tone?: "violet" | "blue" | "green" | "amber" }) {
  const toneClass = { violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300", blue: "bg-sky-500/10 text-sky-600 dark:text-sky-300", green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300" }[tone];
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-[25px] font-semibold tracking-[-.05em]">{value}</p></div>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", toneClass)}><Icon className="h-[17px] w-[17px]" /></span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {trend && <span className={cn("inline-flex items-center gap-0.5 font-semibold", trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-300")}>{trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{trend === "up" ? "+12%" : "−4%"}</span>}
        <span>{note}</span>
      </div>
    </Card>
  );
}
