import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import type { Ticket } from "@/lib/types";
import { Tickets } from "./tickets";

export const metadata = { title: "Bantuan" };

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ data }, sp] = await Promise.all([serverApi<{ data: Ticket[] }>("/tickets"), searchParams]);
  return (
    <>
      <PageTitle title="Bantuan & pengaduan" description="Ajukan izin, pertanyaan, atau laporan. Tiket kategori kekerasan ditangani langsung oleh Satgas." />
      <Tickets initial={data} openNew={sp.new === "1"} />
    </>
  );
}
