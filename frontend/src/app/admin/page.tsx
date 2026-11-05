import { Award, ClipboardCheck, Download, FileSpreadsheet, LifeBuoy, QrCode, ShieldAlert, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import { getCurrentUser } from "@/lib/api-server";
import { Charts, type Analytics } from "./charts";

export const metadata = { title: "Analitik" };

export default async function AdminHome() {
  const [{ data }, user] = await Promise.all([serverApi<{ data: Analytics }>("/admin/analytics"), getCurrentUser()]);
  const t = data.totals;
  const tiles = [
    [Users, "Maba terdaftar", t.maba], [UserCheck, "Mentor", t.mentors], [QrCode, "Total presensi", t.attendances],
    [ClipboardCheck, "Tugas dikumpulkan", t.submissions], [Award, "Sertifikat terbit", t.certificates], [LifeBuoy, "Tiket terbuka", t.open_tickets],
  ] as const;
  return (
    <>
      <PageTitle title="Analitik PKKMB" description="Data diperbarui tiap menit."
        action={user?.role === "ADMIN" && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><a download href="/api/proxy/admin/export/attendance"><FileSpreadsheet />Rekap presensi (Excel)</a></Button>
            <Button asChild variant="outline" size="sm"><a download href="/api/proxy/admin/export/report"><Download />Laporan PDF</a></Button>
          </div>
        )} />
      {t.urgent_tickets > 0 && (
        <Link href="/admin/tiket" className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-telu-red/50 bg-telu-red-50 p-4 font-semibold text-telu-maroon dark:bg-telu-red/10 dark:text-primary">
          <ShieldAlert className="size-6 shrink-0" aria-hidden />{t.urgent_tickets} laporan URGENT (kekerasan) belum selesai — tangani segera.
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([Icon, label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <Icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 font-heading text-2xl font-extrabold tabular-nums">{value.toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <Charts data={data} />
    </>
  );
}
