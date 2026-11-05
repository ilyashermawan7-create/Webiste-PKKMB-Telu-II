"use client";

import { Download, Sun } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CardData } from "./page";

/** Kartu Young TeluTizen + unduh PNG (digambar ulang di canvas agar tajam & tanpa dependensi html2canvas). */
export function IdCard({ data }: { data: CardData }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const [bright, setBright] = useState(false);

  const download = async () => {
    const W = 1012, H = 638; // rasio kartu ID-1 (85.6 × 54 mm)
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#ED1E28"); g.addColorStop(0.6, "#B6252A"); g.addColorStop(1, "#6E1418");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, 0, W, H, 36); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "600 26px Arial"; ctx.fillText("TELKOM UNIVERSITY · PKKMB 2026", 56, 80);
    // Logo PKKMB di badge putih (kanan atas), proporsi asli
    const logo = logoRef.current;
    if (logo?.complete && logo.naturalWidth) {
      const lh = 120, lw = (logo.naturalWidth / logo.naturalHeight) * lh;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(W - lw - 76, 40, lw + 28, lh + 28, 18); ctx.fill();
      ctx.drawImage(logo, W - lw - 62, 54, lw, lh);
    }
    ctx.fillStyle = "#fff"; ctx.font = "800 44px Arial"; ctx.fillText("Young TeluTizen", 56, 140);
    ctx.font = "700 40px Arial"; ctx.fillText(data.name.slice(0, 28), 56, 330);
    ctx.font = "500 28px Arial"; ctx.fillStyle = "rgba(255,255,255,.9)";
    [`NIM ${data.nim ?? "-"}`, `${data.study_program ?? ""}`.slice(0, 36), `${data.faculty_code ?? ""} · ${data.group ?? "-"} · Batch ${data.batch ?? "-"}`].forEach((l, i) => ctx.fillText(l, 56, 385 + i * 44));
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(W - 336, H - 336, 290, 290, 24); ctx.fill();
    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (qrCanvas) ctx.drawImage(qrCanvas, W - 316, H - 316, 250, 250);
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = "500 22px Arial"; ctx.fillText("Creating the Future", 56, H - 50);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `kartu-pkkmb-${data.nim ?? "maba"}.png`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="relative aspect-[1.586] overflow-hidden rounded-3xl bg-telu-gradient p-5 text-white shadow-2xl shadow-telu-red/30 sm:p-6">
        <div className="bg-tech-grid absolute inset-0 opacity-25 [--foreground:#fff]" aria-hidden />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">Telkom University · PKKMB 2026</p>
              <p className="font-heading text-xl font-extrabold">Young TeluTizen</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- dipakai juga sebagai sumber gambar canvas */}
            <img ref={logoRef} src="/brand/logo-pkkmb-mark@2x.png" alt="Logo PKKMB 2026" className="h-12 w-auto shrink-0 rounded-lg bg-white p-1" />
          </div>
          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-extrabold leading-tight sm:text-xl">{data.name}</p>
              <p className="text-sm text-white/90">NIM {data.nim}</p>
              <p className="truncate text-xs text-white/80">{data.study_program}</p>
              <p className="text-xs text-white/80">{data.faculty_code} · {data.group} · Batch {data.batch}</p>
            </div>
            <div className="shrink-0 rounded-xl bg-white p-1.5"><QRCodeSVG value={data.qr} size={96} level="M" title="QR identitas" /></div>
          </div>
        </div>
      </div>
      <div ref={qrRef} className="hidden" aria-hidden><QRCodeCanvas value={data.qr} size={500} level="M" marginSize={1} /></div>

      {bright && (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-white p-8" onClick={() => setBright(false)} aria-label="Tutup mode pindai">
          <QRCodeSVG value={data.qr} size={320} level="M" className="h-auto w-full max-w-xs" />
          <span className="absolute bottom-10 text-sm text-neutral-600">Ketuk untuk menutup</span>
        </button>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => setBright(true)}><Sun />Mode pindai</Button>
        <Button onClick={download}><Download />Unduh PNG</Button>
      </div>
    </div>
  );
}
