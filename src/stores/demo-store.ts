"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoActivity, demoContacts, demoDomains, demoEmails, demoInvitations, demoNotifications, demoPreferences, demoTeamMembers, demoUser, demoWorkspace } from "@/lib/mock-data";
import { makeId } from "@/lib/utils";
import type { ActivityEvent, ComposePayload, Contact, Domain, EmailAddress, EmailFolder, EmailMessage, Invitation, NotificationItem, TeamMember, TeamRole, User, UserPreferences } from "@/types";

interface DemoState {
  user: User;
  workspace: typeof demoWorkspace;
  isAuthenticated: boolean;
  emails: EmailMessage[];
  domains: Domain[];
  contacts: Contact[];
  notifications: NotificationItem[];
  activities: ActivityEvent[];
  teamMembers: TeamMember[];
  invitations: Invitation[];
  preferences: UserPreferences;
  demoLogin: (email?: string, name?: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<UserPreferences, "displayName" | "signature" | "defaultSender" | "replyBehavior">> & { email?: string }) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  toggleStar: (id: string) => void;
  setMessagesRead: (ids: string[], read: boolean) => void;
  moveMessages: (ids: string[], folder: EmailFolder) => void;
  saveDraft: (payload: ComposePayload) => string;
  sendMessage: (payload: ComposePayload) => string;
  deleteDraft: (id: string) => void;
  permanentlyDeleteMessages: (ids: string[]) => void;
  addDomain: (name: string) => Domain | null;
  verifyDomain: (id: string) => void;
  removeDomain: (id: string) => void;
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => Contact;
  updateContact: (id: string, patch: Omit<Contact, "id" | "createdAt">) => void;
  deleteContact: (id: string) => void;
  markNotificationRead: (id: string) => void;
  inviteMember: (email: string, role: Exclude<TeamRole, "Owner">) => Invitation;
  changeMemberRole: (id: string, role: TeamRole) => void;
  cancelInvitation: (id: string) => void;
}

const safeStorage = {
  getItem: (name: string) => {
    try {
      if (typeof window === "undefined") return null;
      const value = window.localStorage.getItem(name);
      if (value === null) return null;
      try { JSON.parse(value); return value; }
      catch { window.localStorage.removeItem(name); return null; }
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(name, value);
    } catch {
      // Storage can be unavailable in private browsing; the demo still works in memory.
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(name);
    } catch {
      // Ignore unavailable storage.
    }
  },
};

const currentTime = () => new Date().toISOString();
const makeActivity = (title: string, description: string, kind: ActivityEvent["kind"], actor = "Alex Morgan"): ActivityEvent => ({
  id: makeId("event"), title, description, kind, actor, date: currentTime(),
});
const parseRecipient = (value: string): EmailAddress[] => value.split(/[;,]/).map((email) => email.trim()).filter(Boolean).map((email) => ({ name: email.split("@")[0]?.replace(/[._-]/g, " ") ?? email, email }));

export const useDemoStore = create<DemoState>()(persist(
  (set, get) => ({
    user: demoUser,
    workspace: demoWorkspace,
    isAuthenticated: true,
    emails: demoEmails,
    domains: demoDomains,
    contacts: demoContacts,
    notifications: demoNotifications,
    activities: demoActivity,
    teamMembers: demoTeamMembers,
    invitations: demoInvitations,
    preferences: demoPreferences,
    demoLogin: (email, name) => set((state) => {
      const nextEmail = email?.trim() || state.user.email;
      const inferredName = name?.trim() || nextEmail.split("@")[0]?.split(/[._-]/).map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1)).join(" ") || state.user.name;
      return { user: { ...state.user, email: nextEmail, name: inferredName }, isAuthenticated: true, preferences: { ...state.preferences, displayName: inferredName } };
    }),
    signOut: () => set({ isAuthenticated: false }),
    updateProfile: (patch) => set((state) => ({
      user: { ...state.user, ...(patch.displayName ? { name: patch.displayName } : {}), ...(patch.email ? { email: patch.email } : {}) },
      preferences: { ...state.preferences, ...patch },
    })),
    updatePreferences: (patch) => set((state) => ({ preferences: { ...state.preferences, ...patch } })),
    toggleStar: (id) => set((state) => ({ emails: state.emails.map((email) => email.id === id ? { ...email, starred: !email.starred } : email) })),
    setMessagesRead: (ids, read) => set((state) => ({ emails: state.emails.map((email) => ids.includes(email.id) ? { ...email, read } : email) })),
    moveMessages: (ids, folder) => set((state) => ({
      emails: state.emails.map((email) => ids.includes(email.id) ? { ...email, folder } : email),
      activities: [makeActivity(folder === "archive" ? "Messages archived" : folder === "trash" ? "Messages moved to trash" : "Messages restored", `${ids.length} message${ids.length === 1 ? "" : "s"} updated in the demo inbox.`, "email"), ...state.activities],
    })),
    saveDraft: (payload) => {
      const id = payload.id || makeId("draft");
      const user = get().user;
      const to = parseRecipient(payload.to);
      const message: EmailMessage = {
        id, from: { name: user.name, email: payload.sender || user.email }, to,
        subject: payload.subject || "(no subject)", preview: payload.body.trim().replace(/\s+/g, " ").slice(0, 110) || "No message content",
        body: payload.body, date: currentTime(), folder: "drafts", read: true, starred: false, attachments: payload.attachments ?? [], labels: [],
      };
      set((state) => ({ emails: [message, ...state.emails.filter((email) => email.id !== id)], activities: [makeActivity("Draft saved", message.subject, "email"), ...state.activities] }));
      return id;
    },
    sendMessage: (payload) => {
      const id = makeId("sent");
      const user = get().user;
      const to = parseRecipient(payload.to);
      const cc = payload.cc ? parseRecipient(payload.cc) : [];
      const message: EmailMessage = {
        id, from: { name: user.name, email: payload.sender || user.email }, to, ...(cc.length ? { cc } : {}),
        subject: payload.subject || "(no subject)", preview: payload.body.trim().replace(/\s+/g, " ").slice(0, 110) || "No message content",
        body: payload.body, date: currentTime(), folder: "sent", read: true, starred: false, attachments: payload.attachments ?? [], labels: [],
      };
      set((state) => ({ emails: [message, ...state.emails.filter((email) => email.id !== payload.id)], activities: [makeActivity("Demo message sent", `“${message.subject}” was added to Sent. Nothing was delivered.`, "email"), ...state.activities] }));
      return id;
    },
    deleteDraft: (id) => set((state) => ({ emails: state.emails.filter((email) => email.id !== id) })),
    permanentlyDeleteMessages: (ids) => set((state) => ({ emails: state.emails.filter((email) => !ids.includes(email.id)) })),
    addDomain: (value) => {
      const name = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (get().domains.some((domain) => domain.name.toLowerCase() === name)) return null;
      const id = makeId("domain");
      const records: Domain["records"] = [
        { id: `${id}-mx`, type: "MX", name: "@", value: "mx.example.invalid", priority: 10, status: "pending", purpose: "Illustrative inbound routing target" },
        { id: `${id}-spf`, type: "TXT", name: "@", value: '"v=spf1 include:mail.example.invalid ~all"', status: "pending", purpose: "Illustrative sender policy" },
        { id: `${id}-dkim`, type: "CNAME", name: "demo._domainkey", value: "demo-key.example.invalid", status: "pending", purpose: "Illustrative signing record" },
        { id: `${id}-dmarc`, type: "TXT", name: "_dmarc", value: '"v=DMARC1; p=none; rua=mailto:dmarc@example.invalid"', status: "pending", purpose: "Illustrative reporting policy" },
      ];
      const domain: Domain = { id, name, status: "pending", dnsStatus: "pending", provider: "Cloudflare", createdAt: currentTime(), mailboxCount: 0, identities: [], records };
      set((state) => ({ domains: [domain, ...state.domains], activities: [makeActivity("Demo domain added", `${name} was added for a local setup walkthrough.`, "domain"), ...state.activities] }));
      return domain;
    },
    verifyDomain: (id) => set((state) => ({
      domains: state.domains.map((domain) => domain.id === id ? { ...domain, status: "verified", dnsStatus: "complete", records: domain.records.map((record) => ({ ...record, status: "verified" })) } : domain),
      activities: [makeActivity("Simulated domain check complete", "A local demo status was updated. No DNS lookup was performed.", "domain"), ...state.activities],
      notifications: [{ id: makeId("notice"), title: "Demo setup complete", description: "Your domain status changed locally. No DNS lookup was performed.", date: currentTime(), read: false, kind: "domain" }, ...state.notifications],
    })),
    removeDomain: (id) => set((state) => ({ domains: state.domains.filter((domain) => domain.id !== id) })),
    addContact: (contact) => {
      const created: Contact = { ...contact, id: makeId("contact"), createdAt: currentTime() };
      set((state) => ({ contacts: [created, ...state.contacts], activities: [makeActivity("Contact added", `${created.name} was added to contacts.`, "contact"), ...state.activities] }));
      return created;
    },
    updateContact: (id, patch) => set((state) => ({ contacts: state.contacts.map((contact) => contact.id === id ? { ...contact, ...patch } : contact) })),
    deleteContact: (id) => set((state) => ({ contacts: state.contacts.filter((contact) => contact.id !== id) })),
    markNotificationRead: (id) => set((state) => ({ notifications: state.notifications.map((notice) => notice.id === id ? { ...notice, read: true } : notice) })),
    inviteMember: (email, role) => {
      const invitation: Invitation = { id: makeId("invite"), email, role, sentAt: currentTime(), status: "pending" };
      set((state) => ({ invitations: [invitation, ...state.invitations], activities: [makeActivity("Demo invitation created", `${email} was added to pending invitations. No email was sent.`, "team"), ...state.activities] }));
      return invitation;
    },
    changeMemberRole: (id, role) => set((state) => ({ teamMembers: state.teamMembers.map((member) => member.id === id && member.role !== "Owner" ? { ...member, role } : member) })),
    cancelInvitation: (id) => set((state) => ({ invitations: state.invitations.filter((invite) => invite.id !== id) })),
  }),
  {
    name: "mailflare-frontend-demo",
    storage: createJSONStorage(() => safeStorage),
    skipHydration: true,
    version: 1,
  },
));
