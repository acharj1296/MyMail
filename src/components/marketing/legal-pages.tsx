import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

const privacySections = [
  { title: "This is a local frontend demo", body: "This project is a user-interface prototype. It does not include a production backend, identity provider, email service, DNS resolver, or Cloudflare API connection. Actions such as signing in, sending email, and checking a domain are simulated in the interface." },
  { title: "Data stored in your browser", body: "The demo may persist mock workspace state—such as sample messages, contacts, theme preferences, and profile details—in localStorage on your device. This local data is controlled by your browser and can be removed by clearing site storage. Do not enter real passwords, private messages, API keys, or other sensitive information." },
  { title: "No real email delivery", body: "The compose flow adds a local mock item to the Sent folder. It does not connect to an SMTP server or transmit messages or attachments. Recovery flows likewise do not send an email." },
  { title: "Illustrative DNS records", body: "Values shown in domain setup are nonfunctional examples for product demonstration. They are not queried, verified, or written to any DNS provider. Do not copy them into a live DNS zone." },
  { title: "Reference project", body: "This interface is an original frontend implementation inspired by the public Mailflare repository. For the reference project’s own privacy practices and deployment model, review its current repository and documentation." },
];
const termsSections = [
  { title: "Use of this preview", body: "This application is provided as a frontend demonstration for evaluation and development. It is not a production email service and should not be used to manage real mailboxes, domains, or account credentials." },
  { title: "No service guarantees", body: "All messages, metrics, identities, workspace members, DNS values, and domain statuses may be fictional or simulated. The preview makes no guarantees about availability, security, privacy, deliverability, or correctness of external configuration." },
  { title: "No live integrations", body: "No backend, SMTP or IMAP server, database, authentication server, Cloudflare API, DNS verification service, or email delivery provider is connected. Buttons labeled demo, simulate, or local only affect browser state." },
  { title: "Use external documentation", body: "If configuring email infrastructure, refer to current instructions from the providers you choose. Provider-specific DNS values may change and depend on your domain and account." },
  { title: "Open-source reference", body: "The user interface is inspired by the open-source Mailflare project maintained at GitHub. This frontend-only demo is not a claim to be the original full application." },
];

export function LegalPage({ page }: { page: "privacy" | "terms" }) {
  const title = page === "privacy" ? "Privacy notice" : "Terms of use";
  const sections = page === "privacy" ? privacySections : termsSections;
  return <main className="min-h-screen bg-background"><header className="mx-auto flex max-w-[960px] items-center justify-between px-5 py-5 sm:px-8"><Brand /><Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back home</Link></header><div className="mx-auto max-w-[960px] px-5 pb-20 pt-10 sm:px-8"><PageHeader eyebrow="Mailflare frontend demo" title={title} description="Plain-language notes about this frontend-only preview." /><Card className="p-5 sm:p-8"><p className="mb-7 rounded-xl border border-amber-500/20 bg-amber-500/[.06] p-4 text-xs leading-6 text-muted-foreground"><strong className="text-foreground">Important:</strong> This note describes the demo interface in this repository. It is not legal advice and does not replace the policies for any separate deployed service.</p><div className="space-y-7">{sections.map((section, index) => <section key={section.title}><h2 className="text-sm font-semibold">{index + 1}. {section.title}</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">{section.body}</p></section>)}</div><div className="mt-8 border-t border-border pt-5"><Link href="https://github.com/hieunc229/mailflare" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">View reference repository<ExternalLink className="h-3.5 w-3.5" /></Link></div></Card><p className="mt-5 text-[10px] text-muted-foreground">Updated for the demo build · October 2026</p></div></main>;
}
