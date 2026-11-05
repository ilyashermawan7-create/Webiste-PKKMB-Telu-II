"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { api, ClientApiError } from "@/lib/api-client";

export type Field = {
  name: string; label: string;
  type: "text" | "textarea" | "number" | "datetime" | "date" | "select" | "checkbox" | "file" | "url";
  options?: [string, string][]; required?: boolean; accept?: string; hint?: string;
};
export type ResourceConfig = { resource: string; title: string; fields: Field[]; columns: [string, string][]; readOnly?: boolean };

type Row = Record<string, unknown> & { id: number };

/** Untuk input datetime-local: ISO → "YYYY-MM-DDTHH:mm" waktu lokal. */
function toLocalInput(v: unknown) {
  if (!v) return "";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function display(v: unknown) {
  if (v === null || v === undefined || v === "") return "–";
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  if (typeof v === "object") return (v as { name?: string; code?: string }).code ?? (v as { name?: string }).name ?? "…";
  return String(v);
}

/** CRUD generik untuk endpoint /admin/content/{resource}. */
export function ContentManager({ config, canWrite }: { config: ResourceConfig; canWrite: boolean }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await api<{ data: Row[] }>(`/admin/content/${config.resource}?per_page=100${q ? `&q=${encodeURIComponent(q)}` : ""}`);
    setRows(res.data);
  }, [config.resource, q]);

  useEffect(() => { setRows(null); const t = setTimeout(() => void load(), 250); return () => clearTimeout(t); }, [load]);

  const open = (row: Row | "new") => {
    setErrors({});
    setEditing(row);
    setValues(row === "new" ? Object.fromEntries(config.fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])) : { ...row });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErrors({});
    const fd = new FormData();
    for (const f of config.fields) {
      const v = values[f.name];
      if (f.type === "file") { if (v instanceof File) fd.append("file", v); continue; }
      if (f.type === "checkbox") { fd.append(f.name, v ? "1" : "0"); continue; }
      if (f.type === "datetime" && v) { fd.append(f.name, new Date(String(v)).toISOString()); continue; }
      if (v !== "" && v !== null && v !== undefined && typeof v !== "object") fd.append(f.name, String(v));
    }
    try {
      const path = editing === "new" ? `/admin/content/${config.resource}` : `/admin/content/${config.resource}/${(editing as Row).id}`;
      await api(path, { method: "POST", body: fd });
      toast.success("Tersimpan");
      setEditing(null);
      void load();
    } catch (err) {
      if (err instanceof ClientApiError && err.errors) setErrors(err.errors);
      toast.error(err instanceof ClientApiError ? err.message : "Gagal menyimpan");
    } finally { setBusy(false); }
  };

  const remove = async (row: Row) => {
    if (!confirm("Hapus data ini? Tindakan tercatat di audit log.")) return;
    await api(`/admin/content/${config.resource}/${row.id}`, { method: "DELETE" });
    toast.success("Dihapus");
    void load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${config.title.toLowerCase()}…`} className="pl-9" aria-label="Cari" /></div>
        {canWrite && !config.readOnly && <Button onClick={() => open("new")}><Plus />Tambah</Button>}
      </div>
      {!rows ? <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div> : rows.length === 0 ? <EmptyState title="Belum ada data" /> : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr>{config.columns.map(([k, l]) => <th key={k} scope="col" className="p-3">{l}</th>)}{canWrite && <th className="p-3"><span className="sr-only">Aksi</span></th>}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  {config.columns.map(([k], i) => <td key={k} className={i === 0 ? "max-w-xs p-3 font-semibold" : "p-3 text-muted-foreground"}><span className="line-clamp-2">{display(r[k])}</span></td>)}
                  {canWrite && (
                    <td className="whitespace-nowrap p-3 text-right">
                      <button type="button" onClick={() => open(r)} className="inline-grid size-8 place-items-center rounded-lg hover:bg-muted" aria-label="Ubah"><Pencil className="size-4" /></button>
                      <button type="button" onClick={() => remove(r)} className="inline-grid size-8 place-items-center rounded-lg text-primary hover:bg-muted" aria-label="Hapus"><Trash2 className="size-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <DialogContent title={`${editing === "new" ? "Tambah" : "Ubah"} ${config.title.toLowerCase()}`} className="max-w-2xl">
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              {config.fields.map((f) => {
                const err = errors[f.name]?.[0] ?? (f.type === "file" ? errors.file?.[0] : undefined);
                const id = `f-${f.name}`;
                const v = values[f.name];
                const set = (x: unknown) => setValues((s) => ({ ...s, [f.name]: x }));
                const wide = f.type === "textarea" || f.type === "file";
                return (
                  <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                    {f.type === "checkbox" ? (
                      <label className="mt-6 flex items-center gap-2 text-sm font-medium"><input id={id} type="checkbox" className="size-4 accent-[#B6252A]" checked={!!v} onChange={(e) => set(e.target.checked)} />{f.label}</label>
                    ) : (
                      <>
                        <Label htmlFor={id}>{f.label}{f.required && <span className="text-primary"> *</span>}</Label>
                        {f.type === "textarea" ? <Textarea id={id} rows={4} value={String(v ?? "")} onChange={(e) => set(e.target.value)} required={f.required} />
                          : f.type === "select" ? <Select id={id} value={String(v ?? "")} onChange={(e) => set(e.target.value)} required={f.required}><option value="">—</option>{f.options?.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</Select>
                          : f.type === "file" ? <Input id={id} type="file" accept={f.accept} className="pt-2.5" onChange={(e) => set(e.target.files?.[0] ?? null)} />
                          : <Input id={id} type={f.type === "datetime" ? "datetime-local" : f.type} value={f.type === "datetime" ? toLocalInput(v) || String(v ?? "") : f.type === "date" ? String(v ?? "").slice(0, 10) : String(v ?? "")} onChange={(e) => set(e.target.value)} required={f.required} step={f.type === "number" ? "any" : undefined} />}
                      </>
                    )}
                    {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
                    {err && <p className="mt-1 text-xs font-medium text-telu-red-700 dark:text-primary" role="alert">{err}</p>}
                  </div>
                );
              })}
              <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button><Button type="submit" loading={busy}>Simpan</Button></div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
