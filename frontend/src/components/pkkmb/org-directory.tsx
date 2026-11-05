"use client";

import { AtSign, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Organization } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrgDirectory({ orgs }: { orgs: Organization[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const cats = useMemo(() => ["Semua", ...Array.from(new Set(orgs.map((o) => o.category)))], [orgs]);
  const list = orgs.filter((o) => (cat === "Semua" || o.category === cat) && `${o.name} ${o.description}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari UKM…" aria-label="Cari UKM" className="pl-9" />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="group" aria-label="Kategori UKM">
          {cats.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium", cat === c ? "border-transparent bg-telu-maroon text-white" : "border-border hover:border-telu-red/40")}>{c}</button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{list.length} UKM ditemukan</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((o) => (
          <article key={o.id} className="rounded-2xl border border-border bg-card p-5 transition hover:border-telu-red/40">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-telu-red-50 font-heading font-extrabold text-telu-maroon dark:bg-telu-red/15 dark:text-primary">{o.name.replace(/^UKM /, "").slice(0, 2).toUpperCase()}</span>
              <div><h2 className="font-bold leading-tight">{o.name}</h2><Badge variant="neutral" className="mt-1">{o.category}</Badge></div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>
            {o.instagram && <a href={`https://instagram.com/${o.instagram}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"><AtSign className="size-4" aria-hidden />@{o.instagram}</a>}
          </article>
        ))}
      </div>
    </>
  );
}
