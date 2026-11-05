"use client";

import { Bot, LifeBuoy, Send, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "bot"; text: string; sources?: string[]; escalate?: boolean };
const SUGGEST = ["Bagaimana cara presensi?", "Apa dress code putri?", "Syarat sertifikat PKKMB?", "Barang apa saja yang dibawa?"];

export function AssistantChat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Halo, Young TeluTizen! Aku Asisten PKKMB. Ada yang bisa kubantu?" }]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ(""); setBusy(true);
    try {
      const res = await api<{ data: { answer: string; sources: string[]; escalate: boolean } }>("/assistant/ask", { method: "POST", json: { question: text } });
      setMsgs((m) => [...m, { role: "bot", text: res.data.answer, sources: res.data.sources, escalate: res.data.escalate }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "bot", text: e instanceof ClientApiError && e.status === 429 ? "Pelan-pelan ya 🙏 Coba lagi sebentar." : "Maaf, asisten sedang tidak tersedia.", escalate: true }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex h-[calc(100dvh-15rem)] min-h-[420px] flex-col rounded-3xl border border-border bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite" aria-busy={busy}>
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", m.role === "bot" ? "bg-telu-gradient text-white" : "bg-muted")} aria-hidden>{m.role === "bot" ? <Bot className="size-4" /> : <UserRound className="size-4" />}</span>
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "bot" ? "rounded-tl-sm bg-muted" : "rounded-tr-sm bg-telu-maroon text-white")}>
              <span className="sr-only">{m.role === "bot" ? "Asisten:" : "Kamu:"}</span>
              <p className="whitespace-pre-line">{m.text}</p>
              {m.sources && m.sources.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Sumber: {m.sources.slice(0, 2).join("; ")}</p>}
              {m.escalate && <Button asChild size="sm" variant="subtle" className="mt-2"><Link href="/dashboard/bantuan?new=1"><LifeBuoy />Hubungi panitia</Link></Button>}
            </div>
          </div>
        ))}
        {busy && <div className="flex gap-3"><span className="grid size-8 place-items-center rounded-full bg-telu-gradient text-white" aria-hidden><Bot className="size-4" /></span><div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3" aria-label="Asisten sedang mengetik">{[0, 1, 2].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-telu-silver" style={{ animationDelay: `${d * 120}ms` }} />)}</div></div>}
        <div ref={end} />
      </div>
      {msgs.length === 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-6">{SUGGEST.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-telu-red/40">{s}</button>)}</div>
      )}
      <form className="flex gap-2 border-t border-border p-3 sm:p-4" onSubmit={(e) => { e.preventDefault(); void ask(q); }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tulis pertanyaanmu…" aria-label="Pertanyaan" maxLength={500} />
        <Button type="submit" size="icon" className="size-11 shrink-0" loading={busy} aria-label="Kirim"><Send /></Button>
      </form>
    </div>
  );
}
