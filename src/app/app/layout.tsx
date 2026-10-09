import { AppShell } from "@/components/layout/app-shell";

export default function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
