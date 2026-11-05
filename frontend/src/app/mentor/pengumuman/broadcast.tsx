"use client";

import { Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";
import type { Group } from "@/lib/types";

export function Broadcast({ groups }: { groups: Group[] }) {
  const [f, setF] = useState({ group_id: String(groups[0]?.id ?? ""), title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      await api("/mentor/announcements", { method: "POST", json: { ...f, group_id: Number(f.group_id) } });
      toast.success("Pengumuman terkirim");
      setF({ ...f, title: "", body: "" });
    } catch (er) { toast.error(er instanceof ClientApiError ? er.message : "Gagal"); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={send} className="max-w-2xl space-y-4 rounded-3xl border border-border bg-card p-6">
      <div><Label htmlFor="g">Gugus</Label><Select id="g" value={f.group_id} onChange={(e) => setF({ ...f, group_id: e.target.value })}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
      <div><Label htmlFor="title">Judul</Label><Input id="title" required maxLength={150} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div><Label htmlFor="body">Isi</Label><Textarea id="body" required rows={6} maxLength={3000} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
      <Button type="submit" loading={busy}><Megaphone />Kirim ke gugus</Button>
    </form>
  );
}
