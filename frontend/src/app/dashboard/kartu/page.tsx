import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import { IdCard } from "./id-card";

export const metadata = { title: "Kartu Digital" };

export type CardData = { name: string; nim: string | null; faculty: string | null; faculty_code: string | null; study_program: string | null; group: string | null; batch: number | null; qr: string };

export default async function CardPage() {
  const { data } = await serverApi<{ data: CardData }>("/me/card");
  return (
    <>
      <PageTitle title="Kartu identitas digital" description="Tunjukkan QR ini ke panitia untuk presensi manual atau verifikasi identitas." />
      <IdCard data={data} />
    </>
  );
}
