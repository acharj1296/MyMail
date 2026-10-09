export type EmailFolder = "inbox" | "sent" | "drafts" | "archive" | "trash";
export type ThemePreference = "light" | "dark" | "system";
export type DensityPreference = "comfortable" | "compact";
export type DomainStatus = "verified" | "pending" | "needs_attention";
export type DNSStatus = "pending" | "verified";
export type DNSRecordType = "MX" | "TXT" | "CNAME";
export type TeamRole = "Owner" | "Admin" | "Member";

export interface EmailAddress {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface EmailMessage {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  folder: EmailFolder;
  read: boolean;
  starred: boolean;
  attachments: Attachment[];
  labels: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: TeamRole;
}

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  plan: "Demo";
}

export interface DNSRecord {
  id: string;
  type: DNSRecordType;
  name: string;
  value: string;
  priority?: number;
  status: DNSStatus;
  purpose: string;
}

export interface Domain {
  id: string;
  name: string;
  status: DomainStatus;
  dnsStatus: "pending" | "partial" | "complete";
  provider: "Cloudflare" | "Resend" | "Amazon SES";
  createdAt: string;
  mailboxCount: number;
  identities: string[];
  records: DNSRecord[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  kind: "domain" | "message" | "account";
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  actor: string;
  kind: "email" | "domain" | "contact" | "account" | "team";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited";
  lastActive: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Exclude<TeamRole, "Owner">;
  sentAt: string;
  status: "pending" | "expired";
}

export interface UserPreferences {
  theme: ThemePreference;
  density: DensityPreference;
  productNotifications: boolean;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  desktopNotifications: boolean;
  displayName: string;
  signature: string;
  defaultSender: string;
  replyBehavior: "reply" | "reply_all";
}

export interface ComposePayload {
  id?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  sender: string;
  attachments?: Attachment[];
}
