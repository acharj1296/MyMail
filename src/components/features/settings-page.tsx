"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Bell, Check, ChevronRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Monitor, Moon, Palette, Save, Smartphone, Sun, UserRound, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { mockSettingsService } from "@/lib/services/mock-services";
import { useDemoStore } from "@/stores/demo-store";
import type { DensityPreference, ThemePreference } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

const profileSchema = z.object({ name: z.string().trim().min(2, "Enter your name."), email: z.string().trim().email("Enter a valid email address.") });
const passwordSchema = z.object({ current: z.string().min(1, "Enter your current password."), next: z.string().min(8, "Use at least 8 characters.").regex(/[0-9]/, "Add at least one number."), confirm: z.string() }).refine((value) => value.next === value.confirm, { path: ["confirm"], message: "Passwords do not match." });
type SettingSection = "overview" | "profile" | "security" | "appearance" | "notifications" | "mailboxes";
const settingNav: { id: SettingSection; label: string; icon: typeof UserRound; href: string }[] = [
  { id: "profile", label: "Profile", icon: UserRound, href: "/app/settings/profile" },
  { id: "security", label: "Security", icon: LockKeyhole, href: "/app/settings/security" },
  { id: "appearance", label: "Appearance", icon: Palette, href: "/app/settings/appearance" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/app/settings/notifications" },
  { id: "mailboxes", label: "Mailboxes", icon: Mail, href: "/app/settings/mailboxes" },
];

export function SettingsPage({ section = "overview" }: { section?: SettingSection }) {
  const user = useDemoStore((state) => state.user);
  const preferences = useDemoStore((state) => state.preferences);
  const updateProfile = useDemoStore((state) => state.updateProfile);
  const signOut = useDemoStore((state) => state.signOut);
  const router = useRouter();
  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: preferences.displayName || user.name, email: user.email } });
  const mailboxForm = useForm<{ displayName: string; defaultSender: string; signature: string; replyBehavior: "reply" | "reply_all" }>({ defaultValues: { displayName: preferences.displayName || user.name, defaultSender: preferences.defaultSender || user.email, signature: preferences.signature, replyBehavior: preferences.replyBehavior } });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { current: "", next: "", confirm: "" } });
  const title = section === "overview" ? "Settings" : settingNav.find((item) => item.id === section)?.label ?? "Settings";
  const description: Record<SettingSection, string> = {
    overview: "Manage the preferences for this local demo workspace.", profile: "Update the name and address shown in this browser demo.", security: "Explore account security controls in frontend-only demo mode.", appearance: "Choose how Mailflare looks on this device.", notifications: "Choose which demo notifications appear in the interface.", mailboxes: "Set your default sender identity and message preferences.",
  };
  const saveProfile = async (values: z.infer<typeof profileSchema>) => {
    await mockSettingsService.save({ displayName: values.name.trim() });
    updateProfile({ displayName: values.name.trim(), email: values.email.trim() });
    toast.success("Profile updated", { description: "Saved locally in this browser." });
  };
  const saveMailboxes = async (values: { displayName: string; defaultSender: string; signature: string; replyBehavior: "reply" | "reply_all" }) => {
    await mockSettingsService.save(values);
    updateProfile({ displayName: values.displayName });
    toast.success("Mailbox preferences saved locally");
  };
  const savePassword = async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    passwordForm.reset();
    toast.info("Demo only", { description: "No password was stored or changed. Connect a backend to enable account security." });
  };
  const updateTheme = (theme: ThemePreference) => { void mockSettingsService.save({ theme }); toast.success(`${theme[0].toUpperCase()}${theme.slice(1)} theme selected`); };
  const updateDensity = (density: DensityPreference) => { void mockSettingsService.save({ density }); toast.success(`${density[0].toUpperCase()}${density.slice(1)} layout selected`); };
  const updateToggle = (key: "productNotifications" | "emailNotifications" | "weeklyDigest" | "desktopNotifications", checked: boolean) => { void mockSettingsService.save({ [key]: checked }); toast.success("Notification preference saved locally"); };

  return (
    <>
      <PageHeader eyebrow="Workspace preferences" title={title} description={description[section]} />
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings navigation" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5 lg:block lg:h-fit lg:space-y-1 lg:p-2">
          {settingNav.map(({ id, label, icon: Icon, href }) => <Link key={id} href={href} aria-current={section === id ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition lg:w-full", section === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="h-4 w-4" /><span>{label}</span></Link>)}
        </nav>
        <div className="min-w-0 space-y-5">
          {section === "overview" && <SettingsOverview />}
          {section === "profile" && <>
            <Card><CardHeader><CardTitle>Personal profile</CardTitle><p className="text-xs text-muted-foreground">This profile is used in the demo interface only.</p></CardHeader><CardContent><form onSubmit={profileForm.handleSubmit(saveProfile)} className="max-w-xl space-y-5">
              <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-sm font-bold text-white">{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="text-xs font-semibold">Profile avatar</p><p className="mt-1 text-[10px] text-muted-foreground">Initials are generated automatically in demo mode.</p></div></div>
              <Field><FieldLabel htmlFor="profile-name">Display name</FieldLabel><Input id="profile-name" {...profileForm.register("name")} /><FieldError>{profileForm.formState.errors.name?.message}</FieldError></Field>
              <Field><FieldLabel htmlFor="profile-email">Email address</FieldLabel><Input id="profile-email" type="email" {...profileForm.register("email")} /><FieldError>{profileForm.formState.errors.email?.message}</FieldError><FieldHint>Changing this updates the local demo identity, not an account login.</FieldHint></Field>
              <div className="flex justify-end"><Button type="submit" disabled={profileForm.formState.isSubmitting}><Save className="h-4 w-4" />{profileForm.formState.isSubmitting ? "Saving…" : "Save changes"}</Button></div>
            </form></CardContent></Card>
            <Card className="border-amber-500/20 bg-amber-500/[.035]"><CardContent className="flex items-start gap-3 p-4"><Sparkles className="mt-0.5 h-4 w-4 text-amber-600" /><p className="text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Local profile.</strong> This frontend demo does not have a real account or identity provider. Your profile changes live only in browser state.</p></CardContent></Card>
          </>}
          {section === "appearance" && <>
            <Card><CardHeader><CardTitle>Theme</CardTitle><p className="text-xs text-muted-foreground">Choose a theme preference for this browser.</p></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{([{ id: "light", label: "Light", icon: Sun, description: "A bright, calm workspace" }, { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" }, { id: "system", label: "System", icon: Monitor, description: "Follow your device" }] as const).map(({ id, label, icon: Icon, description: text }) => <button type="button" key={id} onClick={() => updateTheme(id)} aria-pressed={preferences.theme === id} className={cn("rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", preferences.theme === id ? "border-primary bg-primary/[.045]" : "border-border hover:border-primary/30 hover:bg-muted/30")}><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></span>{preferences.theme === id && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"><Check className="h-3 w-3" /></span>}</div><p className="mt-4 text-xs font-semibold">{label}</p><p className="mt-1 text-[10px] text-muted-foreground">{text}</p></button>)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Layout density</CardTitle><p className="text-xs text-muted-foreground">Choose how much content fits on screen.</p></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{([{ id: "comfortable", label: "Comfortable", description: "More breathing room" }, { id: "compact", label: "Compact", description: "See more at once" }] as const).map(({ id, label, description: text }) => <button type="button" key={id} onClick={() => updateDensity(id)} aria-pressed={preferences.density === id} className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition", preferences.density === id ? "border-primary bg-primary/[.045]" : "border-border hover:border-primary/30")}><span className={cn("mt-0.5 h-4 w-4 rounded-full border", preferences.density === id ? "border-[5px] border-primary" : "border-muted-foreground/50")} /><span><span className="block text-xs font-semibold">{label}</span><span className="mt-1 block text-[10px] text-muted-foreground">{text}</span></span></button>)}</CardContent></Card>
          </>}
          {section === "notifications" && <Card><CardHeader><CardTitle>Notification preferences</CardTitle><p className="text-xs text-muted-foreground">Settings are saved to this browser only.</p></CardHeader><CardContent className="divide-y divide-border">{([
            { key: "productNotifications", label: "In-app product updates", description: "Show workspace tips and setup reminders." },
            { key: "emailNotifications", label: "Email notifications", description: "Email alerts are not sent in this demo." },
            { key: "weeklyDigest", label: "Weekly summary", description: "Preview a weekly digest preference." },
            { key: "desktopNotifications", label: "Desktop notifications", description: "Browser notifications are unavailable in demo mode." },
          ] as const).map(({ key, label, description: text }) => <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="text-xs font-semibold">{label}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{text}</p></div><Toggle checked={preferences[key]} onCheckedChange={(checked) => updateToggle(key, checked)} label={label} /></div>)}</CardContent></Card>}
          {section === "mailboxes" && <Card><CardHeader><CardTitle>Mailbox preferences</CardTitle><p className="text-xs text-muted-foreground">Default identity and reply settings for the demo composer.</p></CardHeader><CardContent><form onSubmit={mailboxForm.handleSubmit(saveMailboxes)} className="max-w-xl space-y-5">
            <Field><FieldLabel htmlFor="mailbox-display">Display name</FieldLabel><Input id="mailbox-display" {...mailboxForm.register("displayName")} /></Field>
            <Field><FieldLabel htmlFor="mailbox-sender">Default sender identity</FieldLabel><Input id="mailbox-sender" type="email" {...mailboxForm.register("defaultSender")} /><FieldHint>This sender will be preselected in the mock composer.</FieldHint></Field>
            <Field><FieldLabel htmlFor="mailbox-signature">Email signature</FieldLabel><Textarea id="mailbox-signature" rows={4} {...mailboxForm.register("signature")} /><FieldHint>Signature content is saved locally. The demo composer does not append it automatically.</FieldHint></Field>
            <Field><FieldLabel htmlFor="mailbox-reply">Default reply behavior</FieldLabel><select id="mailbox-reply" className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm" {...mailboxForm.register("replyBehavior")}><option value="reply">Reply to sender</option><option value="reply_all">Reply to all</option></select></Field>
            <div><p className="text-xs font-semibold">Message list density</p><div className="mt-2 flex gap-2">{(["comfortable", "compact"] as const).map((density) => <button type="button" key={density} onClick={() => updateDensity(density)} className={cn("rounded-lg border px-3 py-2 text-[10px] font-semibold capitalize", preferences.density === density ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>{density}</button>)}</div></div>
            <div className="flex justify-end"><Button type="submit" disabled={mailboxForm.formState.isSubmitting}><Save className="h-4 w-4" />Save preferences</Button></div>
          </form></CardContent></Card>}
          {section === "security" && <>
            <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle>Password</CardTitle><p className="text-xs text-muted-foreground">Password changes are not connected to an account service.</p></div><KeyRound className="h-4 w-4 text-primary" /></CardHeader><CardContent><form onSubmit={passwordForm.handleSubmit(savePassword)} className="max-w-xl space-y-4">
              <Field><FieldLabel htmlFor="current-password">Current password</FieldLabel><div className="relative"><Input id="current-password" type={showCurrent ? "text" : "password"} autoComplete="current-password" {...passwordForm.register("current")} /><button type="button" onClick={() => setShowCurrent((v) => !v)} aria-label={showCurrent ? "Hide current password" : "Show current password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><FieldError>{passwordForm.formState.errors.current?.message}</FieldError></Field>
              <Field><FieldLabel htmlFor="new-password">New password</FieldLabel><div className="relative"><Input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" {...passwordForm.register("next")} /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide new password" : "Show new password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><FieldError>{passwordForm.formState.errors.next?.message}</FieldError></Field>
              <Field><FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel><Input id="confirm-password" type="password" autoComplete="new-password" {...passwordForm.register("confirm")} /><FieldError>{passwordForm.formState.errors.confirm?.message}</FieldError></Field>
              <div className="flex justify-end"><Button type="submit"><KeyRound className="h-4 w-4" />Update password</Button></div>
            </form></CardContent></Card>
            <Card><CardHeader><CardTitle>Two-factor authentication</CardTitle><p className="text-xs text-muted-foreground">An identity provider is not configured for this demo.</p></CardHeader><CardContent><div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Smartphone className="h-4 w-4" /></span><div className="flex-1"><p className="text-xs font-semibold">Unavailable in demo mode</p><p className="mt-1 text-[10px] text-muted-foreground">No real account or second factor can be enrolled here.</p></div><Button variant="secondary" size="sm" disabled aria-describedby="2fa-unavailable">Enable 2FA</Button></div><p id="2fa-unavailable" className="mt-2 text-[10px] text-muted-foreground">Connect an authentication backend to enable account security controls.</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Active sessions</CardTitle><p className="text-xs text-muted-foreground">Illustrative session list; no session tokens are stored.</p></CardHeader><CardContent className="space-y-3">{[{ label: "This browser", detail: "Current demo session · Rajkot, India", current: true }, { label: "Mobile preview", detail: "Sample session · last active yesterday", current: false }].map((session) => <div key={session.label} className="flex items-center gap-3 rounded-xl border border-border p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Monitor className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{session.label} {session.current && <Badge tone="success" className="ml-1">Current</Badge>}</span><span className="mt-1 block text-[10px] text-muted-foreground">{session.detail}</span></span></div>)}<Button variant="danger" size="sm" onClick={() => { signOut(); router.push("/login"); }}><LogOut className="h-4 w-4" />Sign out of demo</Button></CardContent></Card>
          </>}
        </div>
      </div>
    </>
  );
}

function SettingsOverview() {
  return <div className="grid gap-4 sm:grid-cols-2">{settingNav.map(({ id, label, icon: Icon, href }) => <Link key={id} href={href} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-soft"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" /></div><h2 className="mt-4 text-sm font-semibold">{label}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{id === "profile" ? "Your name and account details" : id === "security" ? "Password and session controls" : id === "appearance" ? "Theme and layout density" : id === "notifications" ? "Product and email preferences" : "Default identity and replies"}</p></Link>)}</div>;
}
