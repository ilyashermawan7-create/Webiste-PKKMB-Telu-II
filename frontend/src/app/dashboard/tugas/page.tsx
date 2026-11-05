import { CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/components/dashboard/shell";
import { SubmissionBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { serverApi } from "@/lib/api-server";
import type { Assignment } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Tugas" };

export default async function AssignmentsPage() {
  const { data } = await serverApi<{ data: Assignment[] }>("/assignments");
  return (
    <>
      <PageTitle title="Penugasan" description="Kumpulkan sebelum tenggat. Tugas yang sudah dinilai tidak bisa diubah." />
      <ul className="grid gap-3">
        {data.map((a) => (
          <li key={a.id}>
            <Link href={`/dashboard/tugas/${a.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-telu-red/40 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><SubmissionBadge s={a.submission} due={a.due_at} />{a.is_required && <Badge variant="outline">Wajib</Badge>}<Badge variant="neutral">{a.type === "FILE" ? "Unggah file" : a.type === "LINK" ? "Tautan" : "Teks"}</Badge></div>
                <p className="mt-2 font-bold">{a.title}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground"><CalendarClock className="size-4" aria-hidden />Tenggat {formatDate(a.due_at)} {formatTime(a.due_at)} WIB · +{a.points} poin</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
