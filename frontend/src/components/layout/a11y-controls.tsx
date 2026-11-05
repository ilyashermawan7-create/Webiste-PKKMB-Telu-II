"use client";

import { Languages, Moon, Sun, Type } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SCALES = ["", "lg", "xl"] as const;

/** Kontrol tema, ukuran teks (A/A+/A++), dan bahasa. */
export function A11yControls({ className, invert }: { className?: string; invert?: boolean }) {
  const t = useTranslations("a11y");
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState<(typeof SCALES)[number]>("");
  useEffect(() => {
    setMounted(true);
    setScale((document.documentElement.dataset.fontScale as (typeof SCALES)[number]) ?? "");
  }, []);

  const cycleScale = () => {
    const next = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length]!;
    setScale(next);
    if (next) document.documentElement.dataset.fontScale = next;
    else delete document.documentElement.dataset.fontScale;
    try { localStorage.setItem("font-scale", next); } catch { /* abaikan */ }
  };

  const switchLocale = () => {
    document.cookie = `NEXT_LOCALE=${locale === "id" ? "en" : "id"}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const btn = cn("inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition", invert ? "text-white/90 hover:bg-white/10" : "text-muted-foreground hover:bg-muted hover:text-foreground");

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <button type="button" className={btn} onClick={cycleScale} aria-label={`${t("font")}: ${scale || "normal"}`} title={t("font")}>
        <Type aria-hidden className="size-4" />
        <span aria-hidden>{scale === "" ? "A" : scale === "lg" ? "A+" : "A++"}</span>
      </button>
      <button type="button" className={btn} onClick={switchLocale} aria-label={`${t("language")}: ${locale.toUpperCase()}`} title={t("language")}>
        <Languages aria-hidden className="size-4" />
        <span aria-hidden>{locale.toUpperCase()}</span>
      </button>
      <button type="button" className={btn} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={t("theme")} title={t("theme")}>
        {mounted && resolvedTheme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
