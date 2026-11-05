"use client";

import { MessageSquarePlus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { api, ClientApiError } from "@/lib/api-client";
import type { Ticket } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export const STATUS: Record<Ticket["status"], [string, "default" | "warning" | "success" | "neutral"]> = {
  OPEN: ["Terbuka", "default"], IN_PROGRESS: ["Diproses", "warning"], RESOLVED: ["Selesai", "success"], CLOSED: ["Ditutup", "neutral"],
};
const CAT: Record<Ticket["category"], string> = { BANTUAN: "Bantuan / izin", PENGADUAN: "Pengaduan", KEKERASAN: "Kekerasan" };

export function Tickets({ initial, openNew }: { initial: Ticket[]; openNew: boolean }) {
  const router = useRouter();
  const [creating, setCreating] = useState(openNew);
  const [active, setActive] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ category: "BANTUAN", subject: "", body: "", is_anonymous: false });
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await api("/tickets", { method: "POST", json: form });
      toast.success(form.is_anonymous ? "Laporan anonim terkirim" : "Tiket dibuat");
      setCreating(false); setForm({ category: "BANTUAN", subject: "", body: "", is_anonymous: false });
      router.refresh();
    } catch (err) { setError(err instanceof ClientApiError ? err.message : "Gagal membuat tiket."); } finally { setBusy(false); }
  };

  const open = async (t: Ticket) => {
    const res = await api<{ data: Ticket }>(`/tickets/${t.id}`);
    setActive(res.data);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!active || !reply.trim()) return;
    setBusy(true);
    try {
      const res = await api<{ data: Ticket }>(`/tickets/${active.id}/replies`, { method: "POST", json: { body: reply } });
      setActive(res.data); setReply("");
    } finally { setBusy(false); }
  };

  return (
    <>
      <Button onClick={() => setCreating(true)} className="mb-6"><MessageSquarePlus />Buat tiket</Button>
      {initial.length === 0 ? <EmptyState title="Belum ada tiket">Butuh bantuan? Klik “Buat tiket”.</EmptyState> : (
        <ul className="grid gap-3">
          {initial.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => open(t)} className="w-full rounded-2xl border border-border bg-card p-4 text-left transition hover:border-telu-red/40">
                <div className="flex flex-wrap items-center gap-2"><Badge variant={STATUS[t.status][1]}>{STATUS[t.status][0]}</Badge><Badge variant="neutral">{CAT[t.category]}</Badge><span className="font-mono text-xs text-muted-foreground">{t.code}</span></div>
                <p className="mt-2 font-bold">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent title="Tiket baru" description="Ceritakan kebutuhanmu. Mentor/panitia akan merespons secepatnya.">
          <form onSubmit={create} className="space-y-4">
            <div><Label htmlFor="t-cat">Kategori</Label>
              <Select id="t-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="BANTUAN">Bantuan / izin tidak hadir</option><option value="PENGADUAN">Pengaduan</option><option value="KEKERASAN">Kekerasan / perpeloncoan</option>
              </Select>
            </div>
            <div><Label htmlFor="t-sub">Judul</Label><Input id="t-sub" required maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><Label htmlFor="t-body">Detail</Label><Textarea id="t-body" required minLength={10} rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            {form.category !== "BANTUAN" && (
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 size-4 accent-[#B6252A]" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} />
                <span>Kirim sebagai anonim <span className="block text-xs text-muted-foreground">Identitasmu tidak disimpan; tiket tidak akan muncul di daftar ini. Gunakan halaman Kontak → cek status untuk memantau.</span></span>
              </label>
            )}
            <FieldError message={error} />
            <Button type="submit" loading={busy} className="w-full">Kirim</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        {active && (
          <DialogContent title={active.subject} description={`${active.code} · ${STATUS[active.status][0]}`}>
            <div className="max-h-[50dvh] space-y-3 overflow-y-auto">
              <div className="rounded-xl bg-muted p-3 text-sm">{active.body}</div>
              {active.replies?.map((r) => (
                <div key={r.id} className={cn("rounded-xl p-3 text-sm", r.is_staff ? "bg-telu-red-50 dark:bg-telu-red/10" : "ml-8 bg-muted")}>
                  <p className="text-xs font-semibold text-muted-foreground">{r.is_staff ? "Panitia" : "Kamu"} · {formatDate(r.created_at)}</p>{r.body}
                </div>
              ))}
            </div>
            {active.status !== "CLOSED" && (
              <form onSubmit={send} className="mt-4 flex gap-2">
                <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Balas…" aria-label="Balasan" />
                <Button type="submit" size="icon" className="size-11 shrink-0" loading={busy} aria-label="Kirim balasan"><Send /></Button>
              </form>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
