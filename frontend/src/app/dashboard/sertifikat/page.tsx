import { Award, CheckCircle2, Circle, Download, ExternalLink } from "lucide-react";
import { PageTitle } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { serverApi } from "@/lib/api-server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Sertifikat" };

type Data = {
  eligibility: { eligible: boolean; attendance_rate: number; required_attendance: number; assignments_done: number; assignments_required: number; min_score: number };
  certificate: { number: string; issued_at: string; verify_url: string } | null;
};

export default async function CertificatePage() {
  const { data } = await serverApi<{ data: Data }>("/certificate");
  const e = data.eligibility;
  const reqs = [
    [e.attendance_rate >= e.required_attendance, `Kehadiran sesi wajib ≥ ${Math.round(e.required_attendance * 100)}%`, `${Math.round(e.attendance_rate * 100)}%`],
    [e.assignments_done >= e.assignments_required, `Semua tugas wajib dinilai ≥ ${e.min_score}`, `${e.assignments_done}/${e.assignments_required}`],
  ] as const;
  return (
    <>
      <PageTitle title="Sertifikat PKKMB" description="Sertifikat digital terbit otomatis saat semua syarat terpenuhi, lengkap dengan QR verifikasi." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-5">
            {reqs.map(([ok, label, value]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-muted/60 p-4">
                {ok ? <CheckCircle2 className="size-6 text-success" aria-hidden /> : <Circle className="size-6 text-telu-silver" aria-hidden />}
                <p className="flex-1 text-sm font-semibold">{label}</p>
                <span className="font-heading font-extrabold">{value}</span>
                <span className="sr-only">{ok ? "terpenuhi" : "belum terpenuhi"}</span>
              </div>
            ))}
            <Progress value={(reqs.filter(([ok]) => ok).length / reqs.length) * 100} label="Syarat terpenuhi" />
          </CardContent>
        </Card>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center">
          <div className="absolute inset-y-0 left-0 w-3 bg-telu-gradient" aria-hidden />
          <Award className="mx-auto size-14 text-primary" aria-hidden />
          {data.certificate ? (
            <>
              <h2 className="mt-4 text-xl font-extrabold">Sertifikat telah terbit</h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{data.certificate.number}</p>
              <p className="text-sm text-muted-foreground">Terbit {formatDate(data.certificate.issued_at)}</p>
            </>
          ) : (
            <h2 className="mt-4 text-xl font-extrabold">{e.eligible ? "Kamu memenuhi syarat! 🎉" : "Belum memenuhi syarat"}</h2>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {/* Unduh melalui BFF proxy agar token tetap di cookie httpOnly */}
            <Button asChild disabled={!e.eligible && !data.certificate} className={!e.eligible && !data.certificate ? "pointer-events-none opacity-50" : ""}>
            <a download href="/api/proxy/certificate/download" aria-disabled={!e.eligible && !data.certificate}><Download />Unduh PDF</a>
            </Button>
            {data.certificate && <Button asChild variant="outline"><a href={data.certificate.verify_url} target="_blank" rel="noopener noreferrer">Halaman verifikasi<ExternalLink /></a></Button>}
          </div>
        </div>
      </div>
    </>
  );
}
