import { Award, Brain, CheckCircle2, Flame, Footprints, Map, Sunrise, Trophy, Zap, type LucideIcon } from "lucide-react";
import { PageTitle } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApi } from "@/lib/api-server";
import type { Badge as BadgeT, Mission } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Poin & Badge" };
const ICONS: Record<string, LucideIcon> = { footprints: Footprints, sunrise: Sunrise, map: Map, zap: Zap, brain: Brain, flame: Flame };

type Data = {
  points: number; badges: BadgeT[]; missions: Mission[]; my_group_id: number | null;
  leaderboard: { id: number; code: string; name: string; faculty_code: string | null; members: number; total_points: number; avg_points: number }[];
};

export default async function GamificationPage() {
  const { data } = await serverApi<{ data: Data }>("/me/gamification");
  const owned = data.badges.filter((b) => b.awarded_at).length;
  return (
    <>
      <PageTitle title="Poin & badge" description="Kumpulkan poin dari presensi, tugas, kuis, dan misi harian. Peringkat dihitung per gugus — menang bersama!" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-telu-gradient p-6 text-white">
            <Trophy className="absolute -right-4 -top-4 size-32 text-white/10" aria-hidden />
            <p className="text-sm text-white/80">Total poinmu</p>
            <p className="font-heading text-5xl font-extrabold">{data.points.toLocaleString("id-ID")}</p>
            <p className="mt-2 text-sm text-white/85">{owned} dari {data.badges.length} badge terkumpul</p>
          </div>
          <Card>
            <CardHeader><CardTitle>Koleksi badge</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.badges.map((b) => {
                const I = ICONS[b.icon] ?? Award;
                const has = !!b.awarded_at;
                return (
                  <div key={b.id} className={cn("rounded-2xl border p-4 text-center transition", has ? "border-telu-red/30 bg-telu-red-50/60 dark:bg-telu-red/10" : "border-dashed border-border opacity-60 grayscale")}>
                    <span className={cn("mx-auto grid size-12 place-items-center rounded-full", has ? "bg-telu-gradient text-white" : "bg-muted text-muted-foreground")}><I className="size-6" aria-hidden /></span>
                    <p className="mt-2 text-sm font-bold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                    <span className="sr-only">{has ? "Sudah didapat" : "Belum didapat"}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Misi harian</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.missions.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                  <CheckCircle2 className={m.completed ? "size-5 text-success" : "size-5 text-telu-silver"} aria-hidden />
                  <div className="flex-1"><p className="text-sm font-semibold">{m.title}</p><p className="text-xs text-muted-foreground">{m.description}</p></div>
                  <Badge variant={m.completed ? "success" : "default"}>+{m.points}</Badge>
                </div>
              ))}
              {data.missions.length === 0 && <p className="text-sm text-muted-foreground">Belum ada misi hari ini.</p>}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Leaderboard gugus</CardTitle><p className="text-sm text-muted-foreground">Rata-rata poin anggota, agar adil untuk gugus kecil maupun besar.</p></CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {data.leaderboard.map((g, i) => {
                const mine = g.id === data.my_group_id;
                const max = data.leaderboard[0]?.avg_points || 1;
                return (
                  <li key={g.id} className={cn("rounded-xl border p-3", mine ? "border-telu-maroon bg-telu-red-50 dark:bg-telu-red/10" : "border-border")} aria-current={mine ? "true" : undefined}>
                    <div className="flex items-center gap-3">
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold", i < 3 ? "bg-telu-gradient text-white" : "bg-muted")}>{i + 1}</span>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{g.name}{mine && " (gugusmu)"}</p><p className="text-xs text-muted-foreground">{g.faculty_code} · {g.members} anggota</p></div>
                      <p className="text-right"><span className="font-heading font-extrabold tabular-nums">{g.avg_points}</span><span className="block text-[11px] text-muted-foreground">rata-rata</span></p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-telu-gradient" style={{ width: `${(g.avg_points / max) * 100}%` }} /></div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
