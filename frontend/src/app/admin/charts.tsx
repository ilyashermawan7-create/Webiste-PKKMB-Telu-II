"use client";

import { Table2, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";

export type Analytics = {
  totals: { maba: number; mentors: number; attendances: number; submissions: number; certificates: number; open_tickets: number; urgent_tickets: number };
  attendance: { id: number; title: string; day: number; starts_at: string; attended: number; participants: number; rate: number }[];
  by_faculty: { faculty: string; total: number; male: number; female: number }[];
  assignments: { id: number; title: string; submitted: number; graded: number; total: number }[];
};

/*
 * Aturan visual grafik: satu seri per grafik (warna --primary: maroon di light, merah terang di dark),
 * grid & sumbu redup, ujung bar membulat 4px, tooltip pada hover, dan tampilan tabel sebagai alternatif aksesibel.
 */
const axis = { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false } as const;

function Tip({ active, payload, render }: { active?: boolean; payload?: { payload: Record<string, unknown> }[]; render: (p: Record<string, unknown>) => React.ReactNode }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-lg">{render(payload[0]!.payload)}</div>;
}

function ChartCard({ title, desc, table, children }: { title: string; desc: string; table: React.ReactNode; children: React.ReactNode }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div><CardTitle>{title}</CardTitle><p className="text-sm text-muted-foreground">{desc}</p></div>
        <div className="flex rounded-lg bg-muted p-0.5" role="group" aria-label="Tampilan">
          <button type="button" aria-pressed={view === "chart"} onClick={() => setView("chart")} className={`grid size-8 place-items-center rounded-md ${view === "chart" ? "bg-background shadow-sm" : ""}`} aria-label="Grafik"><BarChart3 className="size-4" /></button>
          <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} className={`grid size-8 place-items-center rounded-md ${view === "table" ? "bg-background shadow-sm" : ""}`} aria-label="Tabel"><Table2 className="size-4" /></button>
        </div>
      </CardHeader>
      <CardContent>{view === "chart" ? children : <div className="max-h-80 overflow-auto">{table}</div>}</CardContent>
    </Card>
  );
}

const th = "p-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export function Charts({ data }: { data: Analytics }) {
  const att = data.attendance.map((s, i) => ({ ...s, label: `S${i + 1}`, pct: Math.round(s.rate * 1000) / 10 }));
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <ChartCard title="Tingkat kehadiran per sesi" desc="Hadir ÷ peserta sesi (sesuai batch/fakultas), %"
        table={<table className="w-full text-sm"><thead><tr><th className={th}>Sesi</th><th className={th}>Hadir</th><th className={th}>Peserta</th><th className={th}>%</th></tr></thead><tbody>{att.map((s) => <tr key={s.id} className="border-t border-border"><td className="p-2">{s.label} · {s.title}</td><td className="p-2 tabular-nums">{s.attended}</td><td className="p-2 tabular-nums">{s.participants}</td><td className="p-2 tabular-nums">{s.pct}%</td></tr>)}</tbody></table>}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={att} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="25%">
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" {...axis} />
              <YAxis domain={[0, 100]} unit="%" {...axis} />
              <Tooltip cursor={{ fill: "var(--muted)" }} content={<Tip render={(p) => (<><p className="font-semibold">{String(p.title)}</p><p className="text-muted-foreground">{String(p.attended)} / {String(p.participants)} hadir · <span className="font-semibold text-foreground">{String(p.pct)}%</span></p></>)} />} />
              <Bar dataKey="pct" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Sebaran maba per fakultas" desc="Jumlah maba; arahkan kursor untuk komposisi putra/putri"
        table={<table className="w-full text-sm"><thead><tr><th className={th}>Fakultas</th><th className={th}>Total</th><th className={th}>Putra</th><th className={th}>Putri</th></tr></thead><tbody>{data.by_faculty.map((f) => <tr key={f.faculty} className="border-t border-border"><td className="p-2 font-semibold">{f.faculty}</td><td className="p-2 tabular-nums">{f.total}</td><td className="p-2 tabular-nums">{f.male}</td><td className="p-2 tabular-nums">{f.female}</td></tr>)}</tbody></table>}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_faculty} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap="20%">
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" {...axis} allowDecimals={false} />
              <YAxis type="category" dataKey="faculty" width={44} {...axis} />
              <Tooltip cursor={{ fill: "var(--muted)" }} content={<Tip render={(p) => (<><p className="font-semibold">{String(p.faculty)} · {String(p.total)} maba</p><p className="text-muted-foreground">Putra {String(p.male)} · Putri {String(p.female)}</p></>)} />} />
              <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card className="xl:col-span-2">
        <CardHeader><CardTitle>Progres penugasan</CardTitle><p className="text-sm text-muted-foreground">Dikumpulkan dari total maba; angka dinilai di kanan</p></CardHeader>
        <CardContent className="space-y-5">
          {data.assignments.map((a) => (
            <div key={a.id}>
              <div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold">{a.title}</span><span className="tabular-nums text-muted-foreground">{a.submitted}/{a.total} dikumpulkan · {a.graded} dinilai</span></div>
              <Progress value={a.total ? (a.submitted / a.total) * 100 : 0} label={`Progres ${a.title}`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
