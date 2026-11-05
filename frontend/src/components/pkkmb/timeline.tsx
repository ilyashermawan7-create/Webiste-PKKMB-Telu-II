"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, MapPin, Monitor, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import type { Faculty, PkkmbSession } from "@/lib/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

const TYPE_LABEL: Record<PkkmbSession["type"], string> = { PRE: "Pre-PKKMB", UNIVERSITAS: "Universitas", FAKULTAS: "Fakultas", PRODI: "Prodi" };

/**
 * Timeline jadwal interaktif: filter hari, batch, fakultas.
 * `showAttendance` menampilkan status hadir (dipakai di dashboard maba).
 */
export function Timeline({ sessions, faculties = [], showFilters = true, showAttendance = false }: { sessions: PkkmbSession[]; faculties?: Pick<Faculty, "id" | "code" | "name">[]; showFilters?: boolean; showAttendance?: boolean }) {
  const days = useMemo(() => Array.from(new Set(sessions.map((s) => s.day_number))).sort((a, b) => a - b), [sessions]);
  const batches = useMemo(() => Array.from(new Set(sessions.map((s) => s.batch).filter((b): b is number => b !== null))).sort(), [sessions]);
  const [day, setDay] = useState<number | "all">("all");
  const [batch, setBatch] = useState<string>("all");
  const [faculty, setFaculty] = useState<string>("all");

  const filtered = sessions.filter((s) =>
    (day === "all" || s.day_number === day) &&
    (batch === "all" || s.batch === null || String(s.batch) === batch) &&
    (faculty === "all" || !s.faculty || s.faculty.code === faculty),
  );
  const grouped = days.map((d) => [d, filtered.filter((s) => s.day_number === d)] as const).filter(([, list]) => list.length);
  const now = Date.now();

  return (
    <div>
      {showFilters && (
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Pilih hari">
            {(["all", ...days] as const).map((d) => (
              <button
                key={d} role="tab" aria-selected={day === d} onClick={() => setDay(d)}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition", day === d ? "border-transparent bg-telu-maroon text-white" : "border-border hover:border-telu-red/40")}
              >
                {d === "all" ? "Semua hari" : d === 0 ? "Pra-PKKMB" : `Hari ${d}`}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <label className="sr-only" htmlFor="f-batch">Batch</label>
            <Select id="f-batch" value={batch} onChange={(e) => setBatch(e.target.value)} className="sm:w-40">
              <option value="all">Semua batch</option>
              {batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}
            </Select>
            <label className="sr-only" htmlFor="f-fac">Fakultas</label>
            <Select id="f-fac" value={faculty} onChange={(e) => setFaculty(e.target.value)} className="sm:w-48">
              <option value="all">Semua fakultas</option>
              {faculties.map((f) => <option key={f.code} value={f.code}>{f.code} — {f.name.replace("Fakultas ", "")}</option>)}
            </Select>
          </div>
        </div>
      )}

      {grouped.length === 0 && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Tidak ada sesi untuk filter ini.</p>}

      <div className="space-y-10">
        {grouped.map(([d, list]) => (
          <section key={d} aria-labelledby={`day-${d}`}>
            <h3 id={`day-${d}`} className="mb-4 flex items-baseline gap-3 text-xl font-extrabold">
              {d === 0 ? "Pra-PKKMB" : `Hari ${d}`}
              <span className="text-sm font-medium text-muted-foreground">{formatDate(list[0]!.starts_at, { weekday: "long" })}</span>
            </h3>
            <ol className="relative ml-3 border-l-2 border-dashed border-telu-red/30">
              {list.map((s, i) => {
                const live = new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() >= now;
                const past = new Date(s.ends_at).getTime() < now;
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.04 }}
                    className="relative mb-4 pl-7 last:mb-0"
                  >
                    <span className={cn("absolute -left-[9px] top-5 size-4 rounded-full border-[3px] border-background", live ? "bg-telu-red animate-pulse" : past ? "bg-telu-silver" : "bg-telu-maroon")} aria-hidden />
                    <article className={cn("rounded-2xl border bg-card p-4 transition hover:shadow-md sm:p-5", live ? "border-telu-red/60 shadow-lg shadow-telu-red/10" : "border-border")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary"><Clock className="size-4" aria-hidden />{formatTime(s.starts_at)}–{formatTime(s.ends_at)} WIB</span>
                        {live && <Badge variant="solid">Sedang berlangsung</Badge>}
                        <Badge variant="neutral">{TYPE_LABEL[s.type]}</Badge>
                        {s.batch && <Badge variant="outline"><Users />Batch {s.batch}</Badge>}
                        {s.faculty && <Badge variant="outline">{s.faculty.code}</Badge>}
                        {showAttendance && s.attended && <Badge variant="success"><CheckCircle2 />Hadir</Badge>}
                        {showAttendance && !s.attended && past && <Badge variant="warning">Tidak tercatat</Badge>}
                      </div>
                      <h4 className="mt-2 text-base font-bold sm:text-lg">{s.title}</h4>
                      {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        {s.mode === "ONLINE" ? <Monitor className="size-4" aria-hidden /> : <MapPin className="size-4" aria-hidden />}
                        {s.location ?? (s.mode === "ONLINE" ? "Daring" : "-")}
                      </p>
                    </article>
                  </motion.li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
