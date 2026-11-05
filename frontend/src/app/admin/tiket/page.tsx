import { PageTitle } from "@/components/dashboard/shell";
import { TicketsAdmin } from "./tickets-admin";

export const metadata = { title: "Tiket" };

export default function TicketsPage() {
  return (
    <>
      <PageTitle title="Tiket & pengaduan" description="Diurutkan berdasarkan prioritas. Identitas pelapor anonim tidak pernah ditampilkan." />
      <TicketsAdmin />
    </>
  );
}
