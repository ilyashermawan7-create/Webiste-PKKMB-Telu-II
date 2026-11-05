"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Kartu statistik dengan angka yang beranimasi saat terlihat. */
export function StatCard({ icon, label, value, suffix, className, tone = "default" }: { icon: React.ReactNode; label: string; value: number; suffix?: string; className?: string; tone?: "default" | "glass" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("id-ID"));

  useEffect(() => {
    if (inView) animate(mv, value, { duration: 1.4, ease: "easeOut" });
  }, [inView, mv, value]);

  return (
    <div ref={ref} className={cn("rounded-2xl p-5", tone === "glass" ? "glass-on-color border border-white/15 text-white" : "border border-border bg-card", className)}>
      <div className={cn("mb-4 inline-flex size-10 items-center justify-center rounded-xl [&_svg]:size-5", tone === "glass" ? "bg-white/15" : "bg-telu-red-50 text-telu-maroon dark:bg-telu-red/15 dark:text-primary")}>
        {icon}
      </div>
      <p className="font-heading text-3xl font-extrabold tabular-nums">
        <motion.span>{text}</motion.span>{suffix}
        <span className="sr-only">{value.toLocaleString("id-ID")}</span>
      </p>
      <p className={cn("mt-1 text-sm", tone === "glass" ? "text-white/80" : "text-muted-foreground")}>{label}</p>
    </div>
  );
}
