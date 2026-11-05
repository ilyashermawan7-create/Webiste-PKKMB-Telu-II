"use client";

import { Accessibility, Download, MessageCircle, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Group } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export type GroupDetail = {
  group: Group;
  sessions: { id: number; title: string; starts_at: string }[];
  members: { id: number; nim: string; name: string; gender: string | null; phone: string | null; study_program: string | null; points: number; accessibility_needs: string | null; attendance: Record<string, string>; attendance_rate: number | null; submissions: number; graded: number }[];
};

const CELL: Record<string, string> = { HADIR: "bg-success text-white", TERLAMBAT: "bg-warning text-white", IZIN: "bg-telu-silver text-white" };

export function GroupRecap({ detail }: { detail: GroupDetail }) {
  const [q, setQ] = useState("");
  const members = detail.members.filter((m) => `${m.name} ${m.nim}`.toLowerCase().includes(q.toLowerCase()));
  const avg = detail.members.length ? Math.round((detail.members.reduce((s, m) => s + (m.attendance_rate ?? 0), 0) / detail.members.length) * 100) : 0;

  const exportCsv = () => {
    const head = ["NIM", "Nama", "Prodi", ...detail.sessions.map((s) => s.title), "Kehadiran", "Tugas", "Poin"];
    const rows = detail.members.map((m) => [m.nim, m.name, m.study_program ?? "", ...detail.sessions.map((s) => m.attendance[s.id] ?? "ALPA"), `${Math.round((m.attendance_rate ?? 0) * 100)}%`, `${m.graded}/${m.submissions}`, m.points]);
    const csv = "﻿" + [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `rekap-${detail.group.code}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Anggota", detail.members.length], ["Rata-rata hadir", `${avg}%`], ["Sesi berjalan", detail.sessions.length]].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl border border-border bg-card p-4"><p className="font-heading text-2xl font-extrabold">{v}</p><p className="text-xs text-muted-foreground">{k}</p></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/NIM" className="pl-9" aria-label="Cari anggota" /></div>
        <Button variant="outline" onClick={exportCsv}><Download />Export CSV</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Rekap presensi gugus {detail.group.name}</caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="sticky left-0 bg-muted p-3">Anggota</th>
              {detail.sessions.map((s, i) => <th key={s.id} scope="col" className="p-3 text-center" title={`${s.title} (${formatDate(s.starts_at)})`}>S{i + 1}</th>)}
              <th scope="col" className="p-3 text-right">Hadir</th><th scope="col" className="p-3 text-right">Tugas</th><th scope="col" className="p-3 text-right">Poin</th><th scope="col" className="p-3"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <th scope="row" className="sticky left-0 bg-card p-3 text-left font-normal">
                  <span className="flex items-center gap-1.5 font-semibold">{m.name}{m.accessibility_needs && <Accessibility className="size-4 text-primary" aria-label={`Kebutuhan aksesibilitas: ${m.accessibility_needs}`} />}</span>
                  <span className="text-xs text-muted-foreground">{m.nim} · {m.study_program}</span>
                </th>
                {detail.sessions.map((s) => {
                  const st = m.attendance[s.id];
                  return <td key={s.id} className="p-2 text-center"><span className={cn("inline-grid size-7 place-items-center rounded-lg text-[10px] font-bold", st ? CELL[st] : "bg-muted text-muted-foreground")} title={st ?? "Tidak hadir"}>{st ? st[0] : "–"}</span></td>;
                })}
                <td className={cn("p-3 text-right font-semibold", (m.attendance_rate ?? 1) < 0.8 && "text-primary")}>{Math.round((m.attendance_rate ?? 0) * 100)}%</td>
                <td className="p-3 text-right">{m.graded}/{m.submissions}</td>
                <td className="p-3 text-right tabular-nums">{m.points}</td>
                <td className="p-3">{m.phone && <a href={`https://wa.me/${m.phone}`} target="_blank" rel="noopener noreferrer" className="inline-grid size-8 place-items-center rounded-lg hover:bg-muted" aria-label={`WhatsApp ${m.name}`}><MessageCircle className="size-4" /></a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">H = hadir, T = terlambat, I = izin, – = tidak tercatat. Merah: kehadiran di bawah 80%.</p>
    </div>
  );
}
