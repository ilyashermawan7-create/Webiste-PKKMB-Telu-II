import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import type { Group } from "@/lib/types";
import { Broadcast } from "./broadcast";

export const metadata = { title: "Pengumuman Gugus" };

export default async function BroadcastPage() {
  const { data } = await serverApi<{ data: Group[] }>("/mentor/groups");
  return (
    <>
      <PageTitle title="Kirim pengumuman" description="Pengumuman langsung tampil (live) di dashboard anggota gugus terpilih." />
      <Broadcast groups={data} />
    </>
  );
}
