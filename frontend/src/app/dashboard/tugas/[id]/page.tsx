import { notFound } from "next/navigation";
import { PageTitle } from "@/components/dashboard/shell";
import { SubmissionBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, serverApi } from "@/lib/api-server";
import type { Assignment } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import { SubmitForm } from "./submit-form";

export default async function AssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const a = await serverApi<{ data: Assignment }>(`/assignments/${id}`).then((r) => r.data).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; });
  const s = a.submission;
  return (
    <>
      <PageTitle title={a.title} description={`Tenggat ${formatDate(a.due_at)} ${formatTime(a.due_at)} WIB · nilai maks ${a.max_score}`} action={<SubmissionBadge s={s} due={a.due_at} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card><CardHeader><CardTitle>Instruksi</CardTitle></CardHeader><CardContent className="whitespace-pre-line leading-relaxed">{a.description}</CardContent></Card>
        <div className="space-y-6">
          {s && (s.status === "GRADED" || s.feedback) && (
            <Card className="border-success/40"><CardHeader><CardTitle>Hasil penilaian</CardTitle></CardHeader>
              <CardContent>
                {s.score !== null && <p className="font-heading text-4xl font-extrabold">{s.score}<span className="text-lg text-muted-foreground">/{a.max_score}</span></p>}
                {s.feedback && <p className="mt-3 rounded-xl bg-muted p-3 text-sm">“{s.feedback}”</p>}
              </CardContent>
            </Card>
          )}
          <Card><CardHeader><CardTitle>{s ? "Pengumpulanmu" : "Kumpulkan tugas"}</CardTitle></CardHeader>
            <CardContent>
              {s && (
                <div className="mb-4 space-y-1 text-sm">
                  <p className="text-muted-foreground">Dikirim {formatDate(s.submitted_at)} {formatTime(s.submitted_at)}</p>
                  {s.file_url && <a href={s.file_url} className="font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer">Lihat file</a>}
                  {s.url && <a href={s.url} className="block truncate font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer">{s.url}</a>}
                  {s.text && <p className="line-clamp-4 rounded-xl bg-muted p-3">{s.text}</p>}
                </div>
              )}
              {s?.status === "GRADED" ? <p className="text-sm text-muted-foreground">Tugas sudah dinilai.</p> : <SubmitForm assignment={a} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
