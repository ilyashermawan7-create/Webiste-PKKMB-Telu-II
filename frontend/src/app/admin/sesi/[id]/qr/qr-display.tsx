"use client";

import { Maximize2, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Qr = { session_id: number; title: string; attendance_open: boolean; token: string; expires_in: number; attendances_count: number };

/** Layar proyektor: QR berganti otomatis mengikuti jendela 30 detik dari server. */
export function QrDisplay({ sessionId }: { sessionId: number }) {
  const [qr, setQr] = useState<Qr | null>(null);
  const [left, setLeft] = useState(30);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await api<{ data: Qr }>(`/admin/sessions/${sessionId}/qr`);
        setQr(res.data);
        setLeft(res.data.expires_in);
        timer = setTimeout(tick, Math.max(1, res.data.expires_in) * 1000 + 300);
      } catch { timer = setTimeout(tick, 5000); }
    };
    void tick();
    return () => clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => { const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000); return () => clearInterval(t); }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-telu-gradient p-6 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Presensi PKKMB · Telkom University</p>
      <h1 className="max-w-4xl text-center text-3xl font-extrabold sm:text-5xl">{qr?.title ?? "Memuat…"}</h1>
      {qr && !qr.attendance_open && <p className="rounded-full bg-white/20 px-4 py-1.5 font-semibold">Presensi belum dibuka</p>}
      <div className="rounded-3xl bg-white p-5 shadow-2xl">
        {qr ? <QRCodeSVG value={qr.token} size={420} level="M" className="h-[min(60vh,70vw)] w-[min(60vh,70vw)]" /> : <div className="size-[min(60vh,70vw)] animate-pulse rounded-2xl bg-neutral-200" />}
      </div>
      <div className="flex items-center gap-6 text-lg">
        <span className="inline-flex items-center gap-2" aria-live="polite"><Users className="size-5" aria-hidden />{qr?.attendances_count ?? 0} hadir</span>
        <span className="tabular-nums">QR berganti dalam {left}s</span>
      </div>
      <p className="text-white/80">Buka dashboard → Presensi → Scan QR</p>
      <Button variant="glass" size="sm" onClick={() => document.documentElement.requestFullscreen?.()} className="absolute right-4 top-4"><Maximize2 />Layar penuh</Button>
    </div>
  );
}
