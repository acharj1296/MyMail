"use client";

import { useDemoStore } from "@/stores/demo-store";
import type { AuthService, ContactService, DomainService, EmailService, SettingsService, TeamService } from "./contracts";

const pause = (ms = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const mockAuthService: AuthService = {
  async signIn(email) { await pause(350); useDemoStore.getState().demoLogin(email); },
  async register(name, email) { await pause(450); useDemoStore.getState().demoLogin(email, name); },
  async requestPasswordReset() { await pause(400); },
};

export const mockEmailService: EmailService = {
  async list(folder) { await pause(120); return useDemoStore.getState().emails.filter((message) => message.folder === folder); },
  async saveDraft(payload) { await pause(160); return useDemoStore.getState().saveDraft(payload); },
  async send(payload) { await pause(450); return useDemoStore.getState().sendMessage(payload); },
  async move(ids, folder) { await pause(180); useDemoStore.getState().moveMessages(ids, folder); },
};

export const mockDomainService: DomainService = {
  async add(name) { await pause(350); const domain = useDemoStore.getState().addDomain(name); if (!domain) throw new Error("This domain is already in your demo workspace."); return domain; },
  async verify(id) { await pause(700); useDemoStore.getState().verifyDomain(id); },
  async remove(id) { await pause(200); useDemoStore.getState().removeDomain(id); },
};

export const mockContactService: ContactService = {
  async add(contact) { await pause(180); return useDemoStore.getState().addContact(contact); },
  async update(id, contact) { await pause(150); useDemoStore.getState().updateContact(id, contact); },
  async remove(id) { await pause(150); useDemoStore.getState().deleteContact(id); },
};

export const mockSettingsService: SettingsService = {
  async save(patch) { await pause(180); useDemoStore.getState().updatePreferences(patch); },
};

export const mockTeamService: TeamService = {
  async invite(email, role) { await pause(250); useDemoStore.getState().inviteMember(email, role); },
};
