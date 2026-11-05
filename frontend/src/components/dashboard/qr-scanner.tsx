"use client";

import { Camera, CameraOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Pemindai QR berbasis kamera (html5-qrcode, dimuat dinamis agar tidak membebani bundle awal).
 * Memanggil `onScan` sekali per kode unik; jeda 2,5 detik sebelum kode yang sama diterima lagi.
 */
export function QrScanner({ onScan, paused }: { onScan: (text: string) => void; paused?: boolean }) {
  const id = "qr-reader";
  const scanner = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const last = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const stop = useCallback(async () => {
    try { if (scanner.current?.isScanning) await scanner.current.stop(); } catch { /* sudah berhenti */ }
    setRunning(false);
  }, []);

  const start = async () => {
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner.current ??= new Html5Qrcode(id, { verbose: false });
      await scanner.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.7); return { width: s, height: s }; } },
        (text) => {
          const now = Date.now();
          if (pausedRef.current || (text === last.current.text && now - last.current.at < 2500)) return;
          last.current = { text, at: now };
          navigator.vibrate?.(60);
          onScan(text);
        },
        () => undefined,
      );
      setRunning(true);
    } catch {
      setError("Kamera tidak dapat diakses. Izinkan akses kamera di pengaturan browser, atau gunakan input manual.");
    }
  };

  useEffect(() => () => { void stop(); }, [stop]);

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border-2 border-dashed border-telu-red/40 bg-black/90">
        <div id={id} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
        {!running && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-white/80">
            <div><Camera className="mx-auto size-10" aria-hidden /><p className="mt-2 text-sm">Kamera belum aktif</p></div>
          </div>
        )}
        {running && <div className="pointer-events-none absolute inset-[15%] rounded-2xl border-4 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" aria-hidden />}
      </div>
      {error && <p role="alert" className="mx-auto mt-3 max-w-sm text-center text-sm text-telu-red-700 dark:text-primary">{error}</p>}
      <div className="mt-4 flex justify-center">
        {running ? <Button variant="outline" onClick={stop}><CameraOff />Matikan kamera</Button> : <Button onClick={start}><Camera />Mulai pindai</Button>}
      </div>
    </div>
  );
}
