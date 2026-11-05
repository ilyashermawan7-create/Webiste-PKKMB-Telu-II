"use client";

import { EyeOff, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label, Select, Textarea } from "@/components/ui/input";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { api } from "@/lib/api-client";
import type { Ticket } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type AdminTicket = Ticket & { reporter?: { name: string; nim: string | null } | null; contact?: string | null };
const PRIO: Record<Ticket["priority"], string> = { URGENT: "bg-telu-maroon text-white", HIGH: "bg-telu-red-100 text-telu-maroon dark:bg-telu-red/20 dark:text-primary", MEDIUM: "bg-muted", LOW: "bg-muted text-muted-foreground" };

export function TicketsAdmin() {
  const [status, setStatus] = useState("OPEN");
  const [list, setList] = useState<AdminTicket[] | null>(null);
  const [active, setActive] = useState<AdminTicket | null>(null);
  const [edit, setEdit] = useState({ status: "", priority: "", reply: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => setList((await api<{ data: AdminTicket[] }>(`/admin/tickets?status=${status}`)).data), [status]);
  useEffect(() => { setList(null); void load(); }, [load]);

  const open = async (t: AdminTicket) => {
    const res = await api<{ data: AdminTicket }>(`/admin/tickets/${t.id}`);
    setActive(res.data); setEdit({ status: res.data.status, priority: res.data.priority, reply: "" });
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!active) return; setBusy(true);
    try {
      const res = await api<{ data: AdminTicket }>(`/admin/tickets/${active.id}`, { method: "PATCH", json: { status: edit.status, priority: edit.priority, reply: edit.reply || null } });
      setActive(res.data); setEdit((x) => ({ ...x, reply: "" })); toast.success("Tiket diperbarui"); void load();
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {[["OPEN", "Terbuka"], ["IN_PROGRESS", "Diproses"], ["RESOLVED", "Selesai"], ["CLOSED", "Ditutup"]].map(([k, l]) => (
          <button key={k} type="button" aria-pressed={status === k} onClick={() => setStatus(k)} className={cn("rounded-full border px-4 py-2 text-sm font-semibold", status === k ? "border-transparent bg-telu-maroon text-white" : "border-border")}>{l}</button>
        ))}
      </div>
      {!list ? <Skeleton className="h-48" /> : list.length === 0 ? <EmptyState title="Tidak ada tiket" /> : (
        <ul className="grid gap-3">
          {list.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => open(t)} className={cn("w-full rounded-2xl border bg-card p-4 text-left transition hover:shadow-md", t.priority === "URGENT" ? "border-telu-red/50" : "border-border")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", PRIO[t.priority])}>{t.priority}</span>
                  <Badge variant="neutral">{t.category}</Badge>
                  {t.category === "KEKERASAN" && <ShieldAlert className="size-4 text-primary" aria-label="Laporan kekerasan" />}
                  {t.is_anonymous && <Badge variant="outline"><EyeOff />Anonim</Badge>}
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{t.code} · {formatDate(t.created_at)}</span>
                </div>
                <p className="mt-2 font-bold">{t.subject}</p>
                <p className="line-clamp-1 text-sm text-muted-foreground">{t.body}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        {active && (
          <DialogContent title={active.subject} description={`${active.code} · ${active.category}${active.is_anonymous ? " · anonim" : active.reporter ? ` · ${active.reporter.name} (${active.reporter.nim ?? "-"})` : ""}`} className="max-w-2xl">
            <div className="max-h-[40dvh] space-y-3 overflow-y-auto">
              <div className="whitespace-pre-line rounded-xl bg-muted p-3 text-sm">{active.body}</div>
              {active.contact && <p className="text-sm"><b>Kontak pelapor:</b> {active.contact}</p>}
              {active.replies?.map((r) => <div key={r.id} className={cn("rounded-xl p-3 text-sm", r.is_staff ? "bg-telu-red-50 dark:bg-telu-red/10" : "bg-muted")}><p className="text-xs font-semibold text-muted-foreground">{r.is_staff ? "Panitia" : "Pelapor"} · {formatDate(r.created_at)}</p>{r.body}</div>)}
            </div>
            <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="st">Status</Label><Select id="st" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => <option key={s}>{s}</option>)}</Select></div>
              <div><Label htmlFor="pr">Prioritas</Label><Select id="pr" value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value })}>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((s) => <option key={s}>{s}</option>)}</Select></div>
              <div className="sm:col-span-2"><Label htmlFor="rp">Balasan (terlihat oleh pelapor)</Label><Textarea id="rp" rows={3} value={edit.reply} onChange={(e) => setEdit({ ...edit, reply: e.target.value })} /></div>
              <div className="flex justify-end sm:col-span-2"><Button type="submit" loading={busy}>Simpan</Button></div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
