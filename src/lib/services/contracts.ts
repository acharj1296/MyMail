import type { ComposePayload, Contact, Domain, EmailMessage, TeamRole, UserPreferences } from "@/types";

/** The UI talks to these small contracts; replace these demo adapters with API clients later. */
export interface AuthService {
  signIn(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}
export interface EmailService {
  list(folder: string): Promise<EmailMessage[]>;
  saveDraft(payload: ComposePayload): Promise<string>;
  send(payload: ComposePayload): Promise<string>;
  move(ids: string[], folder: "archive" | "trash" | "inbox"): Promise<void>;
}
export interface DomainService {
  add(name: string): Promise<Domain>;
  verify(id: string): Promise<void>;
  remove(id: string): Promise<void>;
}
export interface ContactService {
  add(contact: Omit<Contact, "id" | "createdAt">): Promise<Contact>;
  update(id: string, contact: Omit<Contact, "id" | "createdAt">): Promise<void>;
  remove(id: string): Promise<void>;
}
export interface SettingsService {
  save(patch: Partial<UserPreferences>): Promise<void>;
}
export interface TeamService {
  invite(email: string, role: Exclude<TeamRole, "Owner">): Promise<void>;
}
