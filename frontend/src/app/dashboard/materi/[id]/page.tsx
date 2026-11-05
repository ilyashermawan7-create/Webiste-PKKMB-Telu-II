import { ExternalLink, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { serverApi } from "@/lib/api-server";
import type { Material } from "@/lib/types";
import { Quiz } from "./quiz";

export default async function MaterialDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const m = await serverApi<{ data: Material }>(`/materials/${id}`).then((r) => r.data).catch(() => notFound());
  return (
    <>
      <PageTitle title={m.title} description={m.description ?? undefined} />
      <Card className="overflow-hidden">
        {m.type === "VIDEO" && (m.url ? (
          <div className="aspect-video bg-black"><iframe src={m.url} title={m.title} className="h-full w-full" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
        ) : <p className="p-8 text-center text-muted-foreground">Video akan tersedia saat sesi berlangsung.</p>)}
        {m.type === "PDF" && (
          m.file_url ? <iframe src={m.file_url} title={m.title} className="h-[70dvh] w-full" /> : (
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center"><FileText className="size-10 text-telu-silver" aria-hidden /><p className="text-muted-foreground">Modul PDF akan diunggah panitia.</p></CardContent>
          )
        )}
        {m.type === "LINK" && m.url && (
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center"><p className="text-muted-foreground">Materi berada di situs eksternal.</p><Button asChild><a href={m.url} target="_blank" rel="noopener noreferrer">Buka materi<ExternalLink /></a></Button></CardContent>
        )}
      </Card>
      {m.quiz && <div className="mt-8"><Quiz quizId={m.quiz.id} passScore={m.quiz.pass_score} best={m.quiz.best_score} points={m.quiz.points} /></div>}
    </>
  );
}
