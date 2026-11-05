"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";

export type Settings = {
  theme_title: string; theme_tagline: string; year: number; event_start: string; event_end: string;
  teaser_video_url: string | null; virtual_tour_url: string | null; hotline_whatsapp: string; hotline_email: string; instagram: string;
  rector_message: string | null; director_message: string | null; certificate_rules: { min_attendance: number; min_score: number };
};

const local = (iso: string) => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState({ ...initial, event_start: local(initial.event_start), event_end: local(initial.event_end) });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS((x) => ({ ...x, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try {
      await api("/admin/settings", { method: "PATCH", json: {
        ...s, year: Number(s.year), event_start: new Date(s.event_start).toISOString(), event_end: new Date(s.event_end).toISOString(),
        teaser_video_url: s.teaser_video_url || null, virtual_tour_url: s.virtual_tour_url || null,
        certificate_rules: { min_attendance: Number(s.certificate_rules.min_attendance), min_score: Number(s.certificate_rules.min_score) },
      } });
      toast.success("Pengaturan disimpan. Halaman publik diperbarui dalam ±5 menit.");
      router.refresh();
    } catch (err) {
      if (err instanceof ClientApiError && err.errors) setErrors(err.errors);
      toast.error("Periksa kembali isian.");
    } finally { setBusy(false); }
  };
  const E = ({ k }: { k: string }) => errors[k] ? <p className="mt-1 text-xs text-telu-red-700 dark:text-primary" role="alert">{errors[k]![0]}</p> : null;

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Tema & tanggal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="tt">Judul tema</Label><Input id="tt" value={s.theme_title} onChange={(e) => set("theme_title", e.target.value)} /><E k="theme_title" /></div>
          <div><Label htmlFor="tg">Tagline</Label><Input id="tg" value={s.theme_tagline} onChange={(e) => set("theme_tagline", e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label htmlFor="yr">Tahun</Label><Input id="yr" type="number" value={s.year} onChange={(e) => set("year", Number(e.target.value))} /></div>
            <div className="col-span-2"><Label htmlFor="es">Mulai (hari-H)</Label><Input id="es" type="datetime-local" value={s.event_start} onChange={(e) => set("event_start", e.target.value)} /></div>
          </div>
          <div><Label htmlFor="ee">Selesai</Label><Input id="ee" type="datetime-local" value={s.event_end} onChange={(e) => set("event_end", e.target.value)} /></div>
          <div><Label htmlFor="tv">URL embed video teaser (https)</Label><Input id="tv" value={s.teaser_video_url ?? ""} onChange={(e) => set("teaser_video_url", e.target.value)} placeholder="https://www.youtube.com/embed/…" /><E k="teaser_video_url" /></div>
          <div><Label htmlFor="vt">URL embed virtual tour 360°</Label><Input id="vt" value={s.virtual_tour_url ?? ""} onChange={(e) => set("virtual_tour_url", e.target.value)} /><E k="virtual_tour_url" /></div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Kontak</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="wa">WhatsApp hotline (format 62…)</Label><Input id="wa" value={s.hotline_whatsapp} onChange={(e) => set("hotline_whatsapp", e.target.value)} /><E k="hotline_whatsapp" /></div>
            <div><Label htmlFor="em">Email</Label><Input id="em" type="email" value={s.hotline_email} onChange={(e) => set("hotline_email", e.target.value)} /></div>
            <div><Label htmlFor="ig">Instagram</Label><Input id="ig" value={s.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Syarat sertifikat</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="ma">Min. kehadiran (0–1)</Label><Input id="ma" type="number" step="0.05" min={0} max={1} value={s.certificate_rules.min_attendance} onChange={(e) => set("certificate_rules", { ...s.certificate_rules, min_attendance: Number(e.target.value) })} /></div>
            <div><Label htmlFor="ms">Nilai min. tugas</Label><Input id="ms" type="number" min={0} max={100} value={s.certificate_rules.min_score} onChange={(e) => set("certificate_rules", { ...s.certificate_rules, min_score: Number(e.target.value) })} /></div>
          </CardContent>
        </Card>
      </div>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Sambutan</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label htmlFor="rm">Sambutan Rektor</Label><Textarea id="rm" rows={5} value={s.rector_message ?? ""} onChange={(e) => set("rector_message", e.target.value)} /></div>
          <div><Label htmlFor="dm">Sambutan Direktur Kemahasiswaan</Label><Textarea id="dm" rows={5} value={s.director_message ?? ""} onChange={(e) => set("director_message", e.target.value)} /></div>
        </CardContent>
      </Card>
      <div className="lg:col-span-2"><Button type="submit" size="lg" loading={busy}>Simpan pengaturan</Button></div>
    </form>
  );
}
