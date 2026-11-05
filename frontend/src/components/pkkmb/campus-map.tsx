"use client";

import { motion } from "framer-motion";
import { Building, Church, ExternalLink, GraduationCap, Home, HeartPulse, Landmark, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CampusPlace } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof MapPin> = { Akademik: GraduationCap, Acara: Landmark, Ibadah: Church, Hunian: Home, Kesehatan: HeartPulse, Layanan: Building, Kemahasiswaan: Users };

/**
 * Peta kampus interaktif berbasis SVG (ringan, tanpa tile server).
 * Koordinat lat/lng diproyeksikan linear ke kanvas — cukup akurat untuk area kampus.
 */
export function CampusMap({ places }: { places: CampusPlace[] }) {
  const [active, setActive] = useState<CampusPlace | null>(places[0] ?? null);
  const [cat, setCat] = useState("Semua");
  const cats = useMemo(() => ["Semua", ...Array.from(new Set(places.map((p) => p.category)))], [places]);

  // Misi harian "Explorer Kampus" (hanya berhasil bila login sebagai maba; error diabaikan)
  useEffect(() => {
    fetch("/api/proxy/me/missions/visit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "VISIT_MAP" }) }).catch(() => undefined);
  }, []);

  const bounds = useMemo(() => {
    const lats = places.map((p) => p.latitude), lngs = places.map((p) => p.longitude);
    const pad = 0.0012;
    return { minLat: Math.min(...lats) - pad, maxLat: Math.max(...lats) + pad, minLng: Math.min(...lngs) - pad, maxLng: Math.max(...lngs) + pad };
  }, [places]);
  const project = (p: CampusPlace) => ({
    x: ((p.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 1000,
    y: ((bounds.maxLat - p.latitude) / (bounds.maxLat - bounds.minLat)) * 700,
  });

  const visible = places.filter((p) => cat === "Semua" || p.category === cat);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter kategori">
          {cats.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
              className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition", cat === c ? "border-transparent bg-telu-maroon text-white" : "border-border hover:border-telu-red/40")}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/50">
          <svg viewBox="0 0 1000 700" className="h-auto w-full" role="img" aria-label="Peta kampus Telkom University">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="currentColor" strokeOpacity=".07" /></pattern>
            </defs>
            <rect width="1000" height="700" fill="url(#grid)" className="text-foreground" />
            {/* Jalan utama (ilustratif) */}
            <path d="M0 360 C 250 330, 420 420, 1000 380" stroke="currentColor" strokeOpacity=".12" strokeWidth="26" fill="none" className="text-foreground" />
            <path d="M520 0 C 500 200, 560 450, 500 700" stroke="currentColor" strokeOpacity=".12" strokeWidth="20" fill="none" className="text-foreground" />
            <ellipse cx="760" cy="560" rx="90" ry="50" className="fill-success/15" />
            {visible.map((p) => {
              const { x, y } = project(p);
              const on = active?.id === p.id;
              return (
                <g key={p.id} transform={`translate(${x} ${y})`} className="cursor-pointer" onClick={() => setActive(p)}
                  role="button" tabIndex={0} aria-label={p.name} aria-pressed={on}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive(p))}>
                  {on && <motion.circle r="34" fill="#ED1E28" initial={{ opacity: 0.5, scale: 0.4 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ repeat: Infinity, duration: 1.6 }} />}
                  <path d="M0 0 C -14 -18, -18 -24, -18 -34 A 18 18 0 1 1 18 -34 C 18 -24, 14 -18, 0 0Z" fill={on ? "#ED1E28" : "#B6252A"} stroke="#fff" strokeWidth="3" />
                  <circle cy="-34" r="6" fill="#fff" />
                  <text y="22" textAnchor="middle" className={cn("fill-foreground text-[15px] font-semibold", !on && "opacity-70")}>{p.name.split("(")[1]?.replace(")", "") ?? p.name.split(" ").slice(0, 2).join(" ")}</text>
                </g>
              );
            })}
          </svg>
          <p className="absolute bottom-2 right-3 text-[11px] text-muted-foreground">Ilustrasi — posisi perkiraan</p>
        </div>
      </div>

      <aside aria-live="polite">
        {active && (
          <div className="rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
            {(() => { const I = ICONS[active.category] ?? MapPin; return <span className="grid size-12 place-items-center rounded-xl bg-telu-gradient text-white"><I className="size-6" aria-hidden /></span>; })()}
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">{active.category}</p>
            <h2 className="mt-1 text-xl font-extrabold">{active.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{active.description}</p>
            <a className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${active.latitude},${active.longitude}`}>
              Buka di Google Maps <ExternalLink className="size-4" aria-hidden />
            </a>
          </div>
        )}
        <ul className="mt-4 grid gap-2">
          {visible.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setActive(p)} className={cn("w-full rounded-xl px-3 py-2 text-left text-sm transition", active?.id === p.id ? "bg-telu-red-50 font-semibold text-telu-maroon dark:bg-telu-red/15 dark:text-primary" : "hover:bg-muted")}>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
