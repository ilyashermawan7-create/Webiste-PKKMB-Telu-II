import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import { ScannerClient, type ActiveSession } from "./scanner-client";

export const metadata = { title: "Scanner QR" };

export default async function ScannerPage() {
  const { data } = await serverApi<{ data: ActiveSession[] }>("/mentor/sessions/active");
  return (
    <>
      <PageTitle title="Scanner presensi" description="Pindai QR kartu digital maba (mis. maba tanpa kuota/HP mati). Presensi sesi harus dalam keadaan dibuka." />
      <ScannerClient sessions={data} />
    </>
  );
}
