"use client";

import { MessageCircleQuestion, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Highlight kata yang dicari. */
function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return <>{parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="rounded bg-telu-red-100 px-0.5 text-inherit dark:bg-telu-red/30">{p}</mark> : p))}</>;
}

export function FaqSearch({ faqs }: { faqs: Faq[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const cats = useMemo(() => ["Semua", ...Array.from(new Set(faqs.map((f) => f.category)))], [faqs]);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = faqs.filter((f) => (cat === "Semua" || f.category === cat) && words.every((w) => `${f.question} ${f.answer}`.toLowerCase().includes(w)));

  useEffect(() => {
    // Misi harian "Cari tahu dulu"
    fetch("/api/proxy/me/missions/visit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "READ_FAQ" }) }).catch(() => undefined);
  }, []);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik pertanyaanmu, mis. presensi, sertifikat, sepatu…" aria-label="Cari FAQ" className="h-14 rounded-2xl pl-12 text-base" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Kategori FAQ">
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium", cat === c ? "border-transparent bg-telu-maroon text-white" : "border-border hover:border-telu-red/40")}>{c}</button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{list.length} hasil</p>
      <div className="mt-6 rounded-2xl border border-border bg-card px-5">
        {list.length === 0 ? (
          <div className="py-6"><EmptyState icon={<MessageCircleQuestion />} title="Belum ada jawaban untuk itu">Coba kata kunci lain, tanya Asisten PKKMB di dashboard, atau <Link href="/kontak" className="font-semibold text-primary">hubungi panitia</Link>.</EmptyState></div>
        ) : (
          <Accordion type="multiple">
            {list.map((f) => (
              <AccordionItem key={f.id} value={String(f.id)}>
                <AccordionTrigger><span><span className="mr-2 text-xs font-bold uppercase tracking-wider text-primary">{f.category}</span><Mark text={f.question} q={words[0] ?? ""} /></span></AccordionTrigger>
                <AccordionContent><Mark text={f.answer} q={words[0] ?? ""} /></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
