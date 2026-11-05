"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return { d: Math.floor(ms / 864e5), h: Math.floor((ms / 36e5) % 24), m: Math.floor((ms / 6e4) % 60), s: Math.floor((ms / 1e3) % 60), done: ms === 0 };
}

/** Hitung mundur ke hari-H. Render awal statis (SSR) lalu berjalan di klien. */
export function Countdown({ start, end }: { start: string; end: string }) {
  const t = useTranslations("hero");
  const target = new Date(start).getTime();
  const [state, setState] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setState(diff(target));
    const id = setInterval(() => setState(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (state?.done) {
    const ended = Date.now() > new Date(end).getTime();
    return <p className="glass-on-color inline-flex rounded-2xl border border-white/20 px-5 py-3 font-semibold">{ended ? t("done") : t("live")}</p>;
  }

  const units: [number | undefined, string][] = [[state?.d, t("days")], [state?.h, t("hours")], [state?.m, t("minutes")], [state?.s, t("seconds")]];
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/80">{t("countdown")}</p>
      <div className="flex gap-2 sm:gap-3" role="timer" aria-live="off">
        {units.map(([v, label]) => (
          <div key={label} className="glass-on-color min-w-16 rounded-2xl border border-white/20 px-3 py-2.5 text-center sm:min-w-20">
            <span className="block font-heading text-2xl font-extrabold tabular-nums sm:text-3xl">{v === undefined ? "--" : String(v).padStart(2, "0")}</span>
            <span className="text-[11px] uppercase tracking-wider text-white/80">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
