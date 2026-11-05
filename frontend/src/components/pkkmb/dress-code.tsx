"use client";

import { Check, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ITEMS = {
  putra: ["Kemeja putih polos lengan panjang, dimasukkan", "Celana bahan hitam (bukan jeans/chino ketat)", "Ikat pinggang hitam polos", "Rambut rapi, pendek, tidak diwarnai", "Name tag PKKMB / kartu identitas digital di HP"],
  putri: ["Kemeja putih polos lengan panjang, tidak transparan", "Rok hitam panjang berbahan kain (atau celana bahan hitam)", "Kerudung hitam polos bagi yang berjilbab", "Rambut rapi/diikat bagi yang tidak berjilbab", "Name tag PKKMB / kartu identitas digital di HP"],
  sepatu: ["Sepatu hitam tertutup (pantofel/sneakers hitam polos)", "Kaus kaki hitam/putih polos", "Tanpa hak tinggi (maks. 3 cm) & bukan sandal", "Tali sepatu terikat rapi"],
  bawaan: ["Botol minum isi ulang", "HP dengan baterai penuh + power bank (presensi QR)", "Alat tulis & buku catatan", "Obat pribadi & perlengkapan ibadah", "Payung/jas hujan lipat"],
} as const;

type Key = keyof typeof ITEMS;
const LABEL: Record<Key, string> = { putra: "Putra", putri: "Putri", sepatu: "Sepatu", bawaan: "Barang bawaan" };

/** Ilustrasi sederhana (SVG) untuk dress code — bukan foto, aksesibel dengan deskripsi teks. */
function Figure({ kind }: { kind: Key }) {
  const skirt = kind === "putri";
  if (kind === "sepatu" || kind === "bawaan") {
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={kind === "sepatu" ? "Ilustrasi sepatu hitam tertutup" : "Ilustrasi barang bawaan"}>
        <rect x="10" y="10" width="180" height="180" rx="24" className="fill-muted" />
        {kind === "sepatu" ? (
          <g>
            <path d="M40 120c20 0 30-20 50-20s30 20 70 22v18H40z" fill="#16161a" />
            <rect x="40" y="140" width="120" height="8" rx="4" fill="#55565B" />
            <path d="M80 108l8 10M92 104l8 12M104 104l6 12" stroke="#959597" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <rect x="45" y="60" width="30" height="80" rx="8" fill="#B6252A" />
            <rect x="52" y="50" width="16" height="12" rx="3" fill="#55565B" />
            <rect x="95" y="70" width="40" height="70" rx="8" fill="#16161a" />
            <rect x="100" y="78" width="30" height="50" rx="3" fill="#ED1E28" opacity=".8" />
            <rect x="145" y="95" width="20" height="45" rx="4" fill="#959597" />
          </g>
        )}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" role="img" aria-label={`Ilustrasi dress code ${LABEL[kind].toLowerCase()}: kemeja putih, bawahan hitam, sepatu hitam`}>
      <rect x="10" y="10" width="180" height="240" rx="24" className="fill-muted" />
      {skirt ? <path d="M70 30a30 30 0 0 1 60 0v34H70z" fill="#16161a" /> : <rect x="78" y="24" width="44" height="14" rx="7" fill="#16161a" />}
      <circle cx="100" cy="52" r="22" fill="#e8c4a8" />
      {skirt && <path d="M74 52c0 30 52 30 52 0v22H74z" fill="#16161a" />}
      <path d="M60 86c10-10 70-10 80 0l6 70H54z" fill="#fff" stroke="#d4d4d8" strokeWidth="2" />
      <path d="M100 82v74" stroke="#d4d4d8" strokeWidth="2" />
      <rect x="112" y="100" width="20" height="14" rx="3" fill="#ED1E28" />
      {skirt ? <path d="M58 156h84l14 70H44z" fill="#16161a" /> : (
        <g fill="#16161a"><rect x="58" y="156" width="40" height="72" rx="4" /><rect x="102" y="156" width="40" height="72" rx="4" /><rect x="56" y="152" width="88" height="8" rx="2" fill="#2a2a31" /></g>
      )}
      <rect x="54" y="226" width="44" height="12" rx="6" fill="#0e0e11" />
      <rect x="102" y="226" width="44" height="12" rx="6" fill="#0e0e11" />
    </svg>
  );
}

export function DressCodeChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem("pkkmb-dresscode") ?? "{}")); } catch { /* abaikan */ }
  }, []);
  const toggle = (id: string) => setChecked((prev) => {
    const next = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem("pkkmb-dresscode", JSON.stringify(next)); } catch { /* abaikan */ }
    return next;
  });

  return (
    <Tabs defaultValue="putra">
      <TabsList aria-label="Kategori atribut">
        {(Object.keys(ITEMS) as Key[]).map((k) => <TabsTrigger key={k} value={k}>{LABEL[k]}</TabsTrigger>)}
      </TabsList>
      {(Object.keys(ITEMS) as Key[]).map((k) => {
        const items = ITEMS[k];
        const done = items.filter((_, i) => checked[`${k}-${i}`]).length;
        return (
          <TabsContent key={k} value={k} className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
            <div className="mx-auto aspect-[200/260] w-full max-w-[280px]"><Figure kind={k} /></div>
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">{done}/{items.length} siap</p>
                <button type="button" onClick={() => items.forEach((_, i) => checked[`${k}-${i}`] && toggle(`${k}-${i}`))} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="size-3.5" aria-hidden />Reset
                </button>
              </div>
              <Progress value={(done / items.length) * 100} label={`Checklist ${LABEL[k]}`} />
              <ul className="mt-5 space-y-2">
                {items.map((item, i) => {
                  const id = `${k}-${i}`;
                  return (
                    <li key={id}>
                      <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition", checked[id] ? "border-success/40 bg-success/5" : "border-border hover:border-telu-red/40")}>
                        <input type="checkbox" className="peer sr-only" checked={!!checked[id]} onChange={() => toggle(id)} />
                        <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring", checked[id] ? "border-success bg-success text-white" : "border-telu-silver")}>
                          {checked[id] && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                        </span>
                        <span className={cn(checked[id] && "text-muted-foreground line-through")}>{item}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {done === items.length && <p className="mt-4 rounded-xl bg-success/10 p-3 text-sm font-semibold text-success dark:text-emerald-300" role="status">Mantap! Atribut {LABEL[k].toLowerCase()} kamu sudah lengkap.</p>}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
