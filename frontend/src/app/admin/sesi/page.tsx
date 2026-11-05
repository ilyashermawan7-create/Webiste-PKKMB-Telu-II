import { PageTitle } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/api-server";
import { SessionsAdmin } from "./sessions-admin";

export const metadata = { title: "Sesi & QR" };

export default async function SessionsPage() {
  const user = await getCurrentUser();
  return (
    <>
      <PageTitle title="Sesi & presensi" description="Buka/tutup presensi dan tampilkan QR dinamis (berganti tiap 30 detik) di layar sesi." />
      <SessionsAdmin canWrite={user?.role === "ADMIN"} />
    </>
  );
}
