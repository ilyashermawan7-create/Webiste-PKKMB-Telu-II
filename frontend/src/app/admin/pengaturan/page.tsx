import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import { SettingsForm, type Settings } from "./settings-form";

export const metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const { data } = await serverApi<{ data: Settings }>("/admin/settings");
  return (
    <>
      <PageTitle title="Pengaturan PKKMB" description="Ubah tema, tanggal, kontak, dan syarat sertifikat tanpa mengubah kode." />
      <SettingsForm initial={data} />
    </>
  );
}
