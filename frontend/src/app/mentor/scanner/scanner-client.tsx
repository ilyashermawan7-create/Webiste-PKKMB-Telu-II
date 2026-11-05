"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { QrScanner } from "@/components/dashboard/qr-scanner";
import { Label, Select } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";
import { cn, formatTime } from "@/lib/utils";

export type ActiveSession = { id: number; title: string; starts_at: string; attendance_open: boolean; mode: string };
type Log = { ok: boolean; text: string; at: Date };

export function ScannerClient({ sessions }: { sessions: ActiveSession[] }) {
  const [sessionId, setSessionId] = useState(String(sessions.find((s) => s.attendance_open)?.id ?? sessions[0]?.id ?? ""));
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<Log[]>([]);

  const onScan = async (card: string) => {
    if (!sessionId) return;
    setBusy(true);
    try {
      const res = await api<{ data: { name: string; nim: string; status: string; already: boolean } }>("/mentor/scan", { method: "POST", json: { session_id: Number(sessionId), card } });
      const d = res.data;
      setLog((l) => [{ ok: true, text: `${d.name} (${d.nim}) — ${d.already ? "sudah tercatat" : d.status}`, at: new Date() }, ...l].slice(0, 30));
    } catch (e) {
      const msg = e instanceof ClientApiError ? (e.errors ? Object.values(e.errors)[0]?.[0] ?? e.message : e.message) : "Gagal";
      setLog((l) => [{ ok: false, text: msg, at: new Date() }, ...l].slice(0, 30));
      navigator.vibrate?.([80, 60, 80]);
    } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <Label htmlFor="sess">Sesi</Label>
        <Select id="sess" value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="mb-5">
          {sessions.map((s) => <option key={s.id} value={s.id}>{formatTime(s.starts_at)} · {s.title}{s.attendance_open ? "" : " (presensi ditutup)"}</option>)}
        </Select>
        <QrScanner onScan={onScan} paused={busy} />
      </div>
      <div>
        <h2 className="mb-3 font-bold">Riwayat pindai <span className="text-sm font-normal text-muted-foreground">({log.filter((l) => l.ok).length} berhasil)</span></h2>
        <ul className="space-y-2" aria-live="polite">
          {log.map((l, i) => (
            <li key={i} className={cn("flex items-start gap-3 rounded-xl border p-3 text-sm", l.ok ? "border-success/30 bg-success/5" : "border-telu-red/30 bg-telu-red-50/60 dark:bg-telu-red/5")}>
              {l.ok ? <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden /> : <XCircle className="size-5 shrink-0 text-primary" aria-hidden />}
              <span className="flex-1">{l.text}</span><span className="text-xs text-muted-foreground">{l.at.toLocaleTimeString("id-ID")}</span>
            </li>
          ))}
          {log.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Belum ada pindaian.</li>}
        </ul>
      </div>
    </div>
  );
}
