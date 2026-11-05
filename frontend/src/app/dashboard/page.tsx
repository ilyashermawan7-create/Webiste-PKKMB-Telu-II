import { ArrowRight, Award, CalendarClock, CheckCircle2, ClipboardList, Flame, MapPin, MessageCircle, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { AnnouncementCard } from "@/components/pkkmb/announcement-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { getCurrentUser, serverApi } from "@/lib/api-server";
import type { Announcement, Mission, PkkmbSession } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import { NotificationOptIn } from "./notification-opt-in";

type Dashboard = {
  points: number; badges_count: number; group_rank: number | null; pending_assignments: number;
  certificate: { eligible: boolean; attendance_rate: number; required_attendance: number; assignments_done: number; assignments_required: number };
  next_sessions: PkkmbSession[]; missions: Mission[]; announcements: Announcement[];
};

export default async function MabaHome() {
  const [user, { data }] = await Promise.all([getCurrentUser(), serverApi<{ data: Dashboard }>("/me/dashboard")]);
  if (!user) return null;
  const c = data.certificate;
  const progress = Math.min(100, ((Math.min(c.attendance_rate / c.required_attendance, 1) + (c.assignments_required ? c.assignments_done / c.assignments_required : 1)) / 2) * 100);
  const missionsDone = data.missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-6">
      {/* Sapaan + kartu gugus */}
      <section className="relative overflow-hidden rounded-3xl bg-telu-gradient p-6 text-white sm:p-8">
        <div className="bg-tech-grid absolute inset-0 opacity-25 [--foreground:#fff]" aria-hidden />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm text-white/80">Halo,</p>
            <h1 className="text-3xl font-extrabold">{user.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-white/85">{user.study_program?.name} · {user.faculty?.code} · Batch {user.batch ?? "-"}</p>
          </div>
          {user.group && (
            <div className="glass-on-color rounded-2xl border border-white/20 p-4 text-sm">
              <p className="text-white/70">Gugus</p>
              <p className="text-lg font-bold">{user.group.name}</p>
              {user.group.mentor && (
                <p className="mt-1 flex items-center gap-1.5"><UserRound className="size-4" aria-hidden />Mentor: {user.group.mentor.name}
                  {user.group.mentor.phone && <a href={`https://wa.me/${user.group.mentor.phone}`} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold hover:bg-white/30"><MessageCircle className="size-3" aria-hidden />Chat</a>}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [Trophy, "Poin", data.points.toLocaleString("id-ID"), "/dashboard/gamifikasi"],
          [Award, "Badge", data.badges_count, "/dashboard/gamifikasi"],
          [Flame, "Peringkat gugus", data.group_rank ? `#${data.group_rank}` : "-", "/dashboard/gamifikasi"],
          [ClipboardList, "Tugas belum dikumpulkan", data.pending_assignments, "/dashboard/tugas"],
        ].map(([Icon, label, value, href]) => {
          const I = Icon as typeof Trophy;
          return (
            <Link key={label as string} href={href as string} className="rounded-2xl border border-border bg-card p-4 transition hover:border-telu-red/40">
              <I className="size-5 text-primary" aria-hidden />
              <p className="mt-3 font-heading text-2xl font-extrabold">{value as string}</p>
              <p className="text-xs text-muted-foreground">{label as string}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>Sesi berikutnya</CardTitle><Button asChild variant="link" size="sm"><Link href="/dashboard/jadwal">Semua<ArrowRight /></Link></Button></CardHeader>
          <CardContent className="space-y-3">
            {data.next_sessions.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada sesi mendatang.</p>}
            {data.next_sessions.map((s) => {
              const live = new Date(s.starts_at) <= new Date() && new Date(s.ends_at) >= new Date();
              return (
                <div key={s.id} className="flex gap-4 rounded-2xl border border-border p-4">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs font-semibold uppercase text-primary">{formatDate(s.starts_at, { month: "short", day: undefined, year: undefined })}</p>
                    <p className="font-heading text-2xl font-extrabold">{formatDate(s.starts_at, { day: "numeric", month: undefined, year: undefined })}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">{live && <Badge variant="solid">Berlangsung</Badge>}<Badge variant="neutral">{s.mode === "ONLINE" ? "Daring" : "Luring"}</Badge></div>
                    <p className="mt-1 font-bold">{s.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><CalendarClock className="size-4" aria-hidden />{formatTime(s.starts_at)} WIB</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden />{s.location}</span>
                    </p>
                    {live && s.attendance_open && <Button asChild size="sm" className="mt-3"><Link href="/dashboard/presensi">Presensi sekarang</Link></Button>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Progres sertifikat</CardTitle></CardHeader>
            <CardContent>
              <Progress value={progress} label="Progres syarat sertifikat" />
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex justify-between"><span>Kehadiran sesi wajib</span><span className="font-semibold">{Math.round(c.attendance_rate * 100)}% / {Math.round(c.required_attendance * 100)}%</span></li>
                <li className="flex justify-between"><span>Tugas wajib lulus</span><span className="font-semibold">{c.assignments_done} / {c.assignments_required}</span></li>
              </ul>
              {c.eligible && <Button asChild className="mt-4 w-full"><Link href="/dashboard/sertifikat">Unduh sertifikat</Link></Button>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Misi hari ini <span className="text-sm font-medium text-muted-foreground">({missionsDone}/{data.missions.length})</span></CardTitle></CardHeader>
            <CardContent>
              {data.missions.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada misi hari ini.</p> : (
                <ul className="space-y-2">
                  {data.missions.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                      <CheckCircle2 className={m.completed ? "size-5 text-success" : "size-5 text-telu-silver"} aria-hidden />
                      <div className="flex-1"><p className="text-sm font-semibold">{m.title}</p><p className="text-xs text-muted-foreground">{m.description}</p></div>
                      <Badge variant={m.completed ? "success" : "default"}>+{m.points}</Badge>
                      <span className="sr-only">{m.completed ? "selesai" : "belum selesai"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <NotificationOptIn />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Pengumuman untukmu</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.announcements.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>
      </section>
    </div>
  );
}
