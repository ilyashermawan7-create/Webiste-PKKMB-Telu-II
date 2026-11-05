import { PageTitle } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/api-server";
import { ContentTabs } from "./tabs";

export const metadata = { title: "Konten" };

export default async function ContentPage() {
  const user = await getCurrentUser();
  return (
    <>
      <PageTitle title="Kelola konten" description="Perubahan langsung tampil di situs publik (cache ±5 menit) dan tercatat di audit log." />
      <ContentTabs role={user?.role ?? "PANITIA"} />
    </>
  );
}
