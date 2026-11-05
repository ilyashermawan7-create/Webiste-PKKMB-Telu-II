import { redirect } from "next/navigation";
import { ADMIN_NAV, MENTOR_NAV } from "@/components/dashboard/nav-config";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mentor");
  return <DashboardShell user={user} nav={user.role === "MENTOR" ? MENTOR_NAV : ADMIN_NAV}>{children}</DashboardShell>;
}
