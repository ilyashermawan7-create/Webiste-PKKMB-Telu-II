import { redirect } from "next/navigation";
import { MABA_NAV } from "@/components/dashboard/nav-config";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return <DashboardShell user={user} nav={MABA_NAV}>{children}</DashboardShell>;
}
