import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { ReportStatus } from "./report-status";

export const metadata: Metadata = { title: "Cek Status Laporan", robots: { index: false } };

export default async function ReportStatusPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Pengaduan" title="Cek status laporan" description="Masukkan kode dan token yang kamu terima saat mengirim laporan anonim." />
      <Container className="mt-12 max-w-xl"><ReportStatus initialCode={code ?? ""} /></Container>
    </>
  );
}
