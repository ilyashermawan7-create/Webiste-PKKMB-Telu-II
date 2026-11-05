"use client";

import { MonitorUp, Settings2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ContentManager } from "@/components/dashboard/content-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import type { PkkmbSession } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import { SESSION_RESOURCE } from "../konten/resources";

export function SessionsAdmin({ canWrite }: { canWrite: boolean }) {
  const [rows, setRows] = useState<(PkkmbSession & { online_code?: string | null })[] | null>(null);
  const load = useCallback(async () => setRows((await api<{ data: PkkmbSession[] }>("/admin/content/sessions?per_page=100")).data), []);
  useEffect(() => { void load(); }, [load]);

  const toggle = async (s: PkkmbSession) => {
    await api(`/admin/sessions/${s.id}/attendance`, { method: "POST", json: { open: !s.attendance_open } });
    toast.success(s.attendance_open ? "Presensi ditutup" : "Presensi dibuka");
    void load();
  };

  return (
    <Tabs defaultValue="live">
      <TabsList><TabsTrigger value="live"><MonitorUp className="mr-1.5 inline size-4" aria-hidden />Operasional</TabsTrigger>{canWrite && <TabsTrigger value="crud"><Settings2 className="mr-1.5 inline size-4" aria-hidden />Kelola sesi</TabsTrigger>}</TabsList>
      <TabsContent value="live" className="mt-6">
        {!rows ? <Skeleton className="h-40" /> : (
          <ul className="grid gap-3">
            {[...rows].sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant={s.attendance_open ? "success" : "neutral"}>{s.attendance_open ? "Presensi dibuka" : "Presensi ditutup"}</Badge><Badge variant="outline">{s.mode === "ONLINE" ? `Daring · kode ${s.online_code ?? "-"}` : "Luring · QR"}</Badge></div>
                  <p className="mt-1.5 font-bold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(s.starts_at)} · {formatTime(s.starts_at)}–{formatTime(s.ends_at)} · {s.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant={s.attendance_open ? "outline" : "subtle"} size="sm" onClick={() => toggle(s)}>{s.attendance_open ? "Tutup presensi" : "Buka presensi"}</Button>
                  {s.mode === "OFFLINE" && <Button asChild size="sm"><Link href={`/admin/sesi/${s.id}/qr`} target="_blank">Tampilkan QR</Link></Button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
      {canWrite && <TabsContent value="crud" className="mt-6"><ContentManager config={SESSION_RESOURCE} canWrite /></TabsContent>}
    </Tabs>
  );
}
