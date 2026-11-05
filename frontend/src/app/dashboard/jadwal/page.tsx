import { PageTitle } from "@/components/dashboard/shell";
import { Timeline } from "@/components/pkkmb/timeline";
import { serverApi } from "@/lib/api-server";
import type { PkkmbSession } from "@/lib/types";

export const metadata = { title: "Jadwal Saya" };

export default async function MySchedule() {
  const { data } = await serverApi<{ data: PkkmbSession[] }>("/me/schedule");
  return (
    <>
      <PageTitle title="Jadwal saya" description="Sesi sesuai batch & fakultasmu, lengkap dengan status kehadiran." />
      <Timeline sessions={data} showFilters={false} showAttendance />
    </>
  );
}
