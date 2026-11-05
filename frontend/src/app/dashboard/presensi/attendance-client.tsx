"use client";

import { CheckCircle2, KeyRound, MapPin, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { QrScanner } from "@/components/dashboard/qr-scanner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ClientApiError } from "@/lib/api-client";
import type { PkkmbSession } from "@/lib/types";

type Result = { session: string; status: string; already: boolean; points: number };

function getLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30_000 },
    );
  });
}

export function AttendanceClient({ onlineSessions }: { onlineSessions: PkkmbSession[] }) {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const [sessionId, setSessionId] = useState(onlineSessions[0]?.id ? String(onlineSessions[0].id) : "");
  const [code, setCode] = useState("");
  const loc = useRef<Promise<{ lat: number; lng: number } | null> | null>(null);

  const submitQr = async (token: string) => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const position = await (loc.current ??= getLocation());
      const res = await api<{ data: Result }>("/attendance/qr", { method: "POST", json: { token: token.trim(), ...(position ?? {}) } });
      setResult(res.data);
      toast.success(res.data.already ? "Kamu sudah presensi di sesi ini" : `Presensi berhasil! +${res.data.points} poin`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof ClientApiError ? (e.errors ? Object.values(e.errors)[0]?.[0] : e.message) ?? e.message : "Gagal presensi.";
      setError(msg);
      toast.error(msg);
      loc.current = null; // ambil ulang lokasi untuk percobaan berikutnya
    } finally { setBusy(false); }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await api<{ data: Result }>("/attendance/code", { method: "POST", json: { session_id: Number(sessionId), code } });
      setResult(res.data);
      toast.success(res.data.already ? "Kamu sudah presensi" : "Presensi berhasil!");
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Gagal presensi.");
    } finally { setBusy(false); }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-success/40 bg-card p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto size-16 text-success" aria-hidden />
        <h2 className="mt-4 text-2xl font-extrabold">{result.already ? "Sudah tercatat" : "Presensi berhasil!"}</h2>
        <p className="mt-1 text-muted-foreground">{result.session}</p>
        <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1 text-sm font-semibold">Status: {result.status}{result.points ? ` · +${result.points} poin` : ""}</p>
        <Button variant="outline" className="mt-6 w-full" onClick={() => setResult(null)}>Presensi sesi lain</Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="qr" className="mx-auto max-w-xl">
      <TabsList className="w-full"><TabsTrigger value="qr" className="flex-1"><QrCode className="mr-1.5 inline size-4" aria-hidden />Scan QR</TabsTrigger><TabsTrigger value="code" className="flex-1"><KeyRound className="mr-1.5 inline size-4" aria-hidden />Kode sesi</TabsTrigger></TabsList>
      <TabsContent value="qr" className="mt-6">
        <QrScanner onScan={submitQr} paused={busy} />
        <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-xs text-muted-foreground"><MapPin className="size-4 shrink-0" aria-hidden />Beberapa sesi memvalidasi lokasimu (geofence kampus). Izinkan akses lokasi bila diminta.</p>
        <details className="mt-6 rounded-2xl border border-border p-4">
          <summary className="cursor-pointer text-sm font-semibold">Kamera bermasalah? Tempel token QR</summary>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); void submitQr(manual); }}>
            <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Token dari QR" aria-label="Token QR" />
            <Button type="submit" loading={busy}>Kirim</Button>
          </form>
        </details>
        <FieldError message={error} />
      </TabsContent>
      <TabsContent value="code" className="mt-6">
        {onlineSessions.length === 0 ? <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Tidak ada sesi daring yang sedang berlangsung.</p> : (
          <form onSubmit={submitCode} className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <div><Label htmlFor="session">Sesi</Label>
              <Select id="session" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>{onlineSessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</Select>
            </div>
            <div><Label htmlFor="code">Kode presensi</Label><Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono text-lg tracking-[0.3em]" maxLength={12} required autoComplete="off" /></div>
            <FieldError message={error} />
            <Button type="submit" loading={busy} className="w-full">Kirim presensi</Button>
          </form>
        )}
      </TabsContent>
    </Tabs>
  );
}
