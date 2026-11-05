import { BadgeCheck, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { API_URL } from "@/lib/config";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Verifikasi Sertifikat", robots: { index: false } };

type Result = { valid: boolean; number?: string; name?: string; faculty?: string; issued_at?: string };

export default async function VerifyPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  let data: Result = { valid: false };
  if (/^[a-f0-9]{64}$/.test(hash)) {
    const res = await fetch(`${API_URL}/public/certificates/${hash}`, { headers: { Accept: "application/json" }, next: { revalidate: 3600 } }).catch(() => null);
    if (res?.ok) data = (await res.json()).data;
  }
  return (
    <>
      <PageHeader eyebrow="Verifikasi" title="Keaslian sertifikat PKKMB" />
      <Container className="mt-12 max-w-xl">
        <div className={`rounded-3xl border-2 p-8 text-center ${data.valid ? "border-success/40 bg-success/5" : "border-telu-red/40 bg-telu-red-50/50 dark:bg-telu-red/5"}`}>
          {data.valid ? <BadgeCheck className="mx-auto size-14 text-success" aria-hidden /> : <XCircle className="mx-auto size-14 text-primary" aria-hidden />}
          <h2 className="mt-4 text-2xl font-extrabold">{data.valid ? "Sertifikat valid" : "Sertifikat tidak ditemukan"}</h2>
          {data.valid && (
            <dl className="mt-6 grid gap-3 text-left text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Nama</dt><dd className="font-semibold">{data.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Fakultas</dt><dd className="font-semibold">{data.faculty}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Nomor</dt><dd className="font-mono">{data.number}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Terbit</dt><dd>{data.issued_at && formatDate(data.issued_at)}</dd></div>
            </dl>
          )}
        </div>
      </Container>
    </>
  );
}
