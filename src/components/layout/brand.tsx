import Link from "next/link";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ light = false, compact = false, href = "/" }: { light?: boolean; compact?: boolean; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", light && "text-white")} aria-label="Mailflare home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:-rotate-3">
        <Mail className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </span>
      {!compact && <span className="text-[16px] font-bold tracking-[-0.04em]">mailflare</span>}
    </Link>
  );
}
