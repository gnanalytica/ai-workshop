import { AppShell } from "@/components/shell/AppShell";

/**
 * Layout for every authenticated route. Ensures the user has a session
 * (AppShell redirects to /sign-in otherwise) and renders the unified shell.
 */
export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
