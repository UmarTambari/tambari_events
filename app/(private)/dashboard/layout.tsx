import { getCurrentUserId } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

/**
 * Ensures the user is authenticated before any dashboard page or RSC child runs.
 * `getCurrentUserId` is wrapped in React.cache() so nested calls in the same
 * request reuse one Supabase + DB resolution.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getCurrentUserId();

  return <DashboardShell>{children}</DashboardShell>;
}
