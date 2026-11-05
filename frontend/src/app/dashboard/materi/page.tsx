import { BookOpen, FileText, Link2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { serverApi } from "@/lib/api-server";
import type { Material } from "@/lib/types";

export const metadata = { title: "Materi" };
const ICON = { PDF: FileText, VIDEO: PlayCircle, LINK: Link2 } as const;

export default async function MaterialsPage() {
  const { data } = await serverApi<{ data: Material[] }>("/materials");
  return (
    <>
      <PageTitle title="Materi & kuis" description="Pelajari materi tiap sesi, lalu kerjakan kuis singkat untuk poin tambahan." />
      <div className="grid gap-4 sm:grid-cols-2">
        {data.map((m) => {
          const I = ICON[m.type] ?? BookOpen;
          const passed = m.quiz && m.quiz.best_score !== null && m.quiz.best_score >= m.quiz.pass_score;
          return (
            <Link key={m.id} href={`/dashboard/materi/${m.id}`} className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-telu-red/40">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-telu-red-50 text-telu-maroon dark:bg-telu-red/15 dark:text-primary"><I className="size-6" aria-hidden /></span>
              <div className="min-w-0">
                <p className="font-bold">{m.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                {m.quiz && <div className="mt-2">{passed ? <Badge variant="success">Kuis lulus · {m.quiz.best_score}</Badge> : m.quiz.best_score !== null ? <Badge variant="warning">Nilai terbaik {m.quiz.best_score}</Badge> : <Badge>Kuis +{m.quiz.points} poin</Badge>}</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
