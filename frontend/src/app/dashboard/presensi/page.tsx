import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import type { PkkmbSession } from "@/lib/types";
import { AttendanceClient } from "./attendance-client";

export const metadata = { title: "Presensi" };

export default async function AttendancePage() {
  const { data } = await serverApi<{ data: PkkmbSession[] }>("/me/schedule");
  const now = Date.now();
  // Sesi online yang sedang/hampir berlangsung untuk input kode
  const online = data.filter((s) => s.mode === "ONLINE" && new Date(s.ends_at).getTime() > now - 3600_000 && new Date(s.starts_at).getTime() < now + 3600_000);
  return (
    <>
      <PageTitle title="Presensi" description="Sesi luring: pindai QR dinamis di layar. Sesi daring: masukkan kode sesi." />
      <AttendanceClient onlineSessions={online} />
    </>
  );
}
