"use client";

import { useState } from "react";
import { useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, Eye, EyeOff, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, recoverySchema, registerSchema } from "@/lib/validation/schemas";
import { mockAuthService } from "@/lib/services/mock-services";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LoginInput = z.input<typeof loginSchema>;
type LoginForm = z.output<typeof loginSchema>;
type RegisterInput = z.input<typeof registerSchema>;
type RegisterOutput = z.output<typeof registerSchema>;

function AuthFrame({ children, mode }: { children: React.ReactNode; mode: "login" | "register" | "recovery" }) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="marketing-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-500/[.08] blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-sky-400/[.08] blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between"><Brand href="/" /><Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">Back to home</Link></header>
        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_420px] lg:py-16">
          <div className="hidden max-w-[470px] lg:block">
            <Badge tone="primary"><Sparkles className="h-3 w-3" />Local demo workspace</Badge>
            <h1 className="mt-6 text-balance text-[42px] font-semibold leading-[1.08] tracking-[-.055em]">Email on your domain, <span className="text-primary">clear at a glance.</span></h1>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">Explore domain setup, inbox organization, contacts, and workspace preferences in a polished frontend preview.</p>
            <div className="mt-8 space-y-3">{["Fictional data, stored in this browser", "Sending, receiving, and DNS checks are disabled", "No external account or identity provider"].map((text) => <p key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Check className="h-3 w-3" /></span>{text}</p>)}</div>
            <div className="mt-11 grid grid-cols-3 gap-3">{[{ value: "One", label: "workspace" }, { value: "Your", label: "domains" }, { value: "Local", label: "demo state" }].map((item) => <Card key={item.label} className="border-border/70 bg-card/70 p-3"><p className="text-sm font-semibold">{item.value}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.label}</p></Card>)}</div>
          </div>
          <div className="mx-auto w-full max-w-[420px]">{children}<p className="mt-5 text-center text-[10px] leading-5 text-muted-foreground">{mode === "recovery" ? "Password recovery is a frontend simulation. No email will be sent." : "This demo login is not a real authentication system."}</p></div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-[10px] text-muted-foreground"><span>© 2026 Mailflare demo · Frontend preview only</span><span className="flex gap-4"><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></span></footer>
      </div>
    </main>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginInput, unknown, LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: true } });
  const submit = async (values: LoginForm) => {
    setLoading(true);
    try { await mockAuthService.signIn(values.email, values.password); toast.success("You’re in the demo workspace", { description: "No real account was authenticated." }); router.push("/app"); }
    catch { toast.error("Could not start the demo session", { description: "Please try again." }); }
    finally { setLoading(false); }
  };
  const demo = async () => {
    setLoading(true);
    try { await mockAuthService.signIn("alex@northstar.studio", "demo-only-password"); toast.success("Welcome to the sample workspace"); router.push("/app"); }
    finally { setLoading(false); }
  };
  return <AuthFrame mode="login"><Card className="overflow-hidden"><CardContent className="p-6 sm:p-8">
    <div className="mb-6"><Badge tone="primary"><ShieldCheck className="h-3 w-3" />Demo sign in</Badge><h2 className="mt-4 text-[25px] font-semibold tracking-[-.05em]">Welcome back</h2><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Sign in to explore the sample Mailflare workspace.</p></div>
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <Field><FieldLabel htmlFor="login-email">Email address</FieldLabel><Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} /><FieldError>{form.formState.errors.email?.message}</FieldError></Field>
      <Field><div className="flex items-center justify-between"><FieldLabel htmlFor="login-password">Password</FieldLabel><Link href="/forgot-password" className="text-[10px] font-semibold text-primary hover:underline">Forgot password?</Link></div><div className="relative"><Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="At least 8 characters" className="pr-10" {...form.register("password")} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><FieldError>{form.formState.errors.password?.message}</FieldError></Field>
      <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" {...form.register("remember")} />Remember me on this device</label>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Opening demo…" : "Continue"}</Button>
    </form>
    <div className="my-5 flex items-center gap-3 text-[10px] text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
    <Button variant="secondary" onClick={() => void demo()} disabled={loading} className="w-full">Explore with demo user</Button>
    <p className="mt-5 text-center text-xs text-muted-foreground">New to Mailflare? <Link href="/register" className="font-semibold text-primary hover:underline">Create a demo account</Link></p>
  </CardContent></Card></AuthFrame>;
}

export function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterInput, unknown, RegisterOutput>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", password: "", confirmPassword: "", agree: false } });
  const password = useWatch({ control: form.control, name: "password" }) || "";
  const strength = [password.length >= 8, /[A-Za-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const register = async (values: RegisterOutput) => {
    setLoading(true);
    try { await mockAuthService.register(values.name, values.email, values.password); toast.success("Demo profile created", { description: "No password was stored." }); router.push("/app"); }
    catch { toast.error("Could not create a demo profile"); }
    finally { setLoading(false); }
  };
  return <AuthFrame mode="register"><Card className="overflow-hidden"><CardContent className="p-6 sm:p-8">
    <div className="mb-5"><Badge tone="primary"><Sparkles className="h-3 w-3" />Start exploring</Badge><h2 className="mt-4 text-[25px] font-semibold tracking-[-.05em]">Create a demo profile</h2><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Use any email address. This does not create a real account.</p></div>
    <form onSubmit={form.handleSubmit(register)} className="space-y-3.5">
      <Field><FieldLabel htmlFor="register-name">Full name</FieldLabel><Input id="register-name" autoComplete="name" placeholder="Alex Morgan" {...form.register("name")} /><FieldError>{form.formState.errors.name?.message}</FieldError></Field>
      <Field><FieldLabel htmlFor="register-email">Email address</FieldLabel><Input id="register-email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} /><FieldError>{form.formState.errors.email?.message}</FieldError></Field>
      <Field><FieldLabel htmlFor="register-password">Password</FieldLabel><div className="relative"><Input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" className="pr-10" {...form.register("password")} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><div className="mt-2 flex gap-1" aria-label={`Password strength ${strength} of 4`}>{Array.from({ length: 4 }, (_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index < strength ? strength < 3 ? "bg-amber-400" : "bg-emerald-500" : "bg-muted"}`} />)}</div><FieldHint>Use 8+ characters with a letter and a number. Passwords are never persisted by this demo.</FieldHint><FieldError>{form.formState.errors.password?.message}</FieldError></Field>
      <Field><FieldLabel htmlFor="register-confirm">Confirm password</FieldLabel><Input id="register-confirm" type="password" autoComplete="new-password" placeholder="Type it again" {...form.register("confirmPassword")} /><FieldError>{form.formState.errors.confirmPassword?.message}</FieldError></Field>
      <FieldError>{form.formState.errors.agree?.message}</FieldError><label className="flex items-start gap-2 text-[10px] leading-5 text-muted-foreground"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-primary" {...form.register("agree")} /><span>I understand this is a frontend-only demo and the details I enter are not used to create a real account.</span></label>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating demo…" : "Create demo profile"}</Button>
    </form>
    <p className="mt-5 text-center text-xs text-muted-foreground">Already explored? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
  </CardContent></Card></AuthFrame>;
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof recoverySchema>>({ resolver: zodResolver(recoverySchema), defaultValues: { email: "" } });
  const submit = async (values: z.infer<typeof recoverySchema>) => {
    setLoading(true);
    try { await mockAuthService.requestPasswordReset(values.email); setSent(true); toast.success("Demo response ready", { description: "No password recovery email was sent." }); }
    catch { toast.error("Could not complete the demo request"); }
    finally { setLoading(false); }
  };
  return <AuthFrame mode="recovery"><Card><CardContent className="p-6 sm:p-8">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span><h2 className="mt-5 text-[25px] font-semibold tracking-[-.05em]">Reset your password</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Enter an address to preview the recovery flow. This demo does not send an email or change a password.</p>
    {sent ? <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[.06] p-4"><p className="text-xs font-semibold">Request simulated</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">If this were a connected account, instructions could be sent to <strong className="text-foreground">{form.getValues("email")}</strong>. No message was delivered.</p><Button variant="secondary" className="mt-4 w-full" onClick={() => { setSent(false); form.reset(); }}>Try another address</Button></div> : <form onSubmit={form.handleSubmit(submit)} className="mt-5 space-y-4"><Field><FieldLabel htmlFor="recovery-email">Email address</FieldLabel><Input id="recovery-email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} /><FieldError>{form.formState.errors.email?.message}</FieldError></Field><Button type="submit" className="w-full" disabled={loading}>{loading ? "Preparing…" : "Continue"}</Button></form>}
    <p className="mt-5 text-center text-xs text-muted-foreground"><Link href="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
  </CardContent></Card></AuthFrame>;
}
