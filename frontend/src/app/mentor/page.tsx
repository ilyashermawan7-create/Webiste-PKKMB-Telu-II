import Link from "next/link";
import { PageTitle } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { serverApi } from "@/lib/api-server";
import type { Group } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GroupRecap, type GroupDetail } from "./group-recap";

export const metadata = { title: "Gugus Saya" };

export default async function MentorHome({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  const [{ data: groups }, sp] = await Promise.all([serverApi<{ data: Group[] }>("/mentor/groups"), searchParams]);
  const selected = groups.find((g) => String(g.id) === sp.g) ?? groups[0];
  const detail = selected ? (await serverApi<{ data: GroupDetail }>(`/mentor/groups/${selected.id}`)).data : null;

  return (
    <>
      <PageTitle title="Gugus bimbingan" description="Rekap kehadiran & tugas anggota. Data pribadi hanya untuk keperluan pendampingan (UU PDP)." />
      {groups.length === 0 ? <EmptyState title="Belum ada gugus yang ditetapkan untukmu" /> : (
        <>
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {groups.map((g) => (
              <Link key={g.id} href={`/mentor?g=${g.id}`} className={cn("shrink-0 rounded-2xl border px-4 py-2.5 text-sm", g.id === selected?.id ? "border-transparent bg-telu-maroon text-white" : "border-border bg-card hover:border-telu-red/40")}>
                <span className="font-bold">{g.name}</span> <Badge variant={g.id === selected?.id ? "solid" : "neutral"} className="ml-1">{g.members_count}</Badge>
              </Link>
            ))}
          </div>
          {detail && <GroupRecap detail={detail} />}
        </>
      )}
    </>
  );
}
