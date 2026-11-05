"use client";

import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { api, ClientApiError } from "@/lib/api-client";
import type { Submission } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function Grading({ items, status }: { items: Submission[]; status: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<number, { score: string; feedback: string }>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const grade = async (s: Submission, next: "GRADED" | "REVISION") => {
    const f = form[s.id] ?? { score: "", feedback: "" };
    setBusy(s.id);
    try {
      await api(`/mentor/submissions/${s.id}/grade`, { method: "POST", json: { status: next, score: next === "GRADED" ? Number(f.score) : null, feedback: f.feedback || null } });
      toast.success(next === "GRADED" ? "Nilai tersimpan" : "Diminta revisi");
      router.refresh();
    } catch (e) { toast.error(e instanceof ClientApiError ? e.message : "Gagal menyimpan"); } finally { setBusy(null); }
  };

  return (
    <>
      <div className="mb-6 flex gap-2">
        {[["SUBMITTED", "Menunggu"], ["REVISION", "Revisi"], ["GRADED", "Dinilai"]].map(([k, l]) => (
          <Link key={k} href={`?status=${k}`} className={cn("rounded-full border px-4 py-2 text-sm font-semibold", status === k ? "border-transparent bg-telu-maroon text-white" : "border-border")}>{l}</Link>
        ))}
      </div>
      {items.length === 0 ? <EmptyState title="Tidak ada pengumpulan di sini" /> : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {items.map((s) => {
            const f = form[s.id] ?? { score: s.score?.toString() ?? "", feedback: s.feedback ?? "" };
            const set = (patch: Partial<typeof f>) => setForm((x) => ({ ...x, [s.id]: { ...f, ...patch } }));
            return (
              <li key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><p className="font-bold">{s.user?.name}</p><p className="text-xs text-muted-foreground">{s.user?.nim} · {formatDate(s.submitted_at)}</p></div>
                  <Badge variant="neutral">{s.assignment?.title}</Badge>
                </div>
                <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                  {s.file_url && <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary"><FileText className="size-4" aria-hidden />Buka file</a>}
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate font-semibold text-primary"><ExternalLink className="size-4 shrink-0" aria-hidden />{s.url}</a>}
                  {s.text && <p className="line-clamp-6 whitespace-pre-line">{s.text}</p>}
                  {!s.file_url && !s.url && !s.text && <p className="text-muted-foreground">(data contoh tanpa lampiran)</p>}
                </div>
                <div className="mt-4 grid grid-cols-[100px_1fr] gap-3">
                  <div><Label htmlFor={`sc-${s.id}`}>Nilai /{s.assignment?.max_score}</Label><Input id={`sc-${s.id}`} type="number" min={0} max={s.assignment?.max_score} value={f.score} onChange={(e) => set({ score: e.target.value })} /></div>
                  <div><Label htmlFor={`fb-${s.id}`}>Umpan balik</Label><Textarea id={`fb-${s.id}`} className="min-h-11" rows={2} value={f.feedback} onChange={(e) => set({ feedback: e.target.value })} /></div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => grade(s, "REVISION")} loading={busy === s.id}>Minta revisi</Button>
                  <Button size="sm" onClick={() => grade(s, "GRADED")} disabled={f.score === ""} loading={busy === s.id}>Simpan nilai</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
