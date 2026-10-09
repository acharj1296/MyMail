"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toggle({ checked, onCheckedChange, label, disabled = false }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onCheckedChange(!checked)} className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50", checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}>
      <span className={cn("pointer-events-none flex h-5 w-5 translate-x-0.5 items-center justify-center rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-[22px]")}>{checked && <Check className="h-3 w-3 text-primary" />}</span>
    </button>
  );
}
