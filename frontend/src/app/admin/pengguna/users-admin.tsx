"use client";

import { FileUp, Shuffle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ClientApiError } from "@/lib/api-client";
import type { Group, User } from "@/lib/types";

type Page<T> = { data: T[]; meta?: { total: number; current_page: number; last_page: number } };

function UsersTable() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState<Page<User & { is_active?: boolean }> | null>(null);
  const load = useCallback(async () => setRes(await api(`/admin/users?per_page=25&page=${page}&q=${encodeURIComponent(q)}&role=${role}`)), [q, role, page]);
  useEffect(() => { const t = setTimeout(() => void load(), 250); return () => clearTimeout(t); }, [load]);

  const changeRole = async (u: User, r: string) => {
    try { await api(`/admin/users/${u.id}`, { method: "PATCH", json: { role: r } }); toast.success("Role diperbarui"); void load(); }
    catch (e) { toast.error(e instanceof ClientApiError ? e.message : "Gagal"); }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari nama / NIM" className="sm:w-72" aria-label="Cari pengguna" />
        <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="sm:w-44" aria-label="Filter role"><option value="">Semua role</option>{["MABA", "MENTOR", "PANITIA", "ADMIN"].map((r) => <option key={r}>{r}</option>)}</Select>
      </div>
      {!res ? <Skeleton className="h-64" /> : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Nama</th><th className="p-3">NIM</th><th className="p-3">Fakultas</th><th className="p-3">Gugus</th><th className="p-3">Poin</th><th className="p-3">Role</th></tr></thead>
              <tbody>{res.data.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3"><span className="font-semibold">{u.name}</span><span className="block text-xs text-muted-foreground">{u.email}</span></td>
                  <td className="p-3 font-mono text-xs">{u.nim ?? "–"}</td><td className="p-3">{u.faculty?.code ?? "–"}</td><td className="p-3">{u.group?.code ?? "–"}</td><td className="p-3 tabular-nums">{u.points}</td>
                  <td className="p-3"><Select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="h-9 w-32 text-xs" aria-label={`Role ${u.name}`}>{["MABA", "MENTOR", "PANITIA", "ADMIN"].map((r) => <option key={r}>{r}</option>)}</Select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{res.meta?.total ?? res.data.length} pengguna</span>
            <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button><Button size="sm" variant="outline" disabled={!res.meta || page >= res.meta.last_page} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button></div>
          </div>
        </>
      )}
    </>
  );
}

function ImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; errors: Record<string, string> } | null>(null);
  const [size, setSize] = useState("25");
  const [assign, setAssign] = useState<Record<string, number> | null>(null);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try { const fd = new FormData(); fd.append("file", file); setResult((await api<{ data: typeof result }>("/admin/import/users", { method: "POST", body: fd })).data); }
    catch (e) { toast.error(e instanceof ClientApiError ? e.message : "Import gagal"); } finally { setBusy(false); }
  };
  const autoAssign = async () => {
    if (!confirm("Bagikan semua maba yang belum memiliki gugus?")) return;
    setBusy(true);
    try { setAssign((await api<{ data: Record<string, number> }>("/admin/groups/auto-assign", { method: "POST", json: { group_size: Number(size), only_unassigned: true } })).data); toast.success("Pembagian gugus selesai"); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-bold">Import CSV</h2>
        <p className="mt-1 text-sm text-muted-foreground">Header: <code className="rounded bg-muted px-1 text-xs">nim,name,email,gender,faculty_code,study_program_code,role,phone,batch</code>. Dari Excel: <em>Save As → CSV UTF-8</em>. Data lama dengan NIM sama akan diperbarui.</p>
        <a className="mt-2 inline-block text-sm font-semibold text-primary hover:underline" href={`data:text/csv;charset=utf-8,${encodeURIComponent("nim,name,email,gender,faculty_code,study_program_code,role,phone,batch\n1301260999,Contoh Maba,1301260999@student.telkomuniversity.ac.id,P,FIF,1301,MABA,628123456789,1\n")}`} download="template-import-maba.csv">Unduh template</a>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 hover:border-telu-red/40">
          <FileUp className="size-6 text-primary" aria-hidden /><span className="text-sm font-semibold">{file?.name ?? "Pilih file .csv"}</span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Button className="mt-4" onClick={upload} disabled={!file} loading={busy}>Import</Button>
        {result && (
          <div className="mt-4 rounded-xl bg-muted p-4 text-sm" role="status">
            <p><Badge variant="success">{result.created} baru</Badge> <Badge>{result.updated} diperbarui</Badge> <Badge variant="warning">{Object.keys(result.errors).length} gagal</Badge></p>
            {Object.entries(result.errors).slice(0, 10).map(([line, msg]) => <p key={line} className="mt-1 text-xs">Baris {line}: {msg}</p>)}
          </div>
        )}
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-bold">Pembagian gugus otomatis</h2>
        <p className="mt-1 text-sm text-muted-foreground">Seimbang per fakultas, gender diselang-seling, selisih jumlah anggota antar gugus ≤ 1. Gugus baru dibuat otomatis bila kapasitas kurang.</p>
        <div className="mt-4 max-w-40"><Label htmlFor="size">Ukuran gugus</Label><Input id="size" type="number" min={5} max={60} value={size} onChange={(e) => setSize(e.target.value)} /></div>
        <Button className="mt-4" onClick={autoAssign} loading={busy}><Shuffle />Bagikan gugus</Button>
        {assign && <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">{Object.entries(assign).map(([f, n]) => <li key={f} className="rounded-xl bg-muted p-2">{f}: <b>{n}</b> maba</li>)}{Object.keys(assign).length === 0 && <li className="text-muted-foreground">Semua maba sudah memiliki gugus.</li>}</ul>}
      </div>
    </div>
  );
}

function GroupsPanel() {
  const [groups, setGroups] = useState<(Group & { mentor?: { id: number; name: string } | null })[] | null>(null);
  const [mentors, setMentors] = useState<User[]>([]);
  const load = useCallback(async () => {
    const [g, m] = await Promise.all([api<{ data: Group[] }>("/admin/groups"), api<{ data: User[] }>("/admin/users?role=MENTOR&per_page=100")]);
    setGroups(g.data); setMentors(m.data);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const setMentor = async (g: Group, mentorId: string) => {
    try { await api(`/admin/groups/${g.id}`, { method: "PATCH", json: { mentor_id: mentorId ? Number(mentorId) : null } }); toast.success("Mentor ditetapkan"); void load(); }
    catch (e) { toast.error(e instanceof ClientApiError ? e.message : "Gagal"); }
  };
  if (!groups) return <Skeleton className="h-64" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((g) => (
        <div key={g.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between"><p className="font-bold">{g.name}</p><Badge variant="neutral">{g.members_count} anggota</Badge></div>
          <p className="text-xs text-muted-foreground">{g.faculty?.code} · Batch {g.batch ?? "-"}</p>
          <Select className="mt-3 h-9 text-sm" value={g.mentor?.id ?? ""} onChange={(e) => setMentor(g, e.target.value)} aria-label={`Mentor ${g.name}`}>
            <option value="">— Pilih mentor —</option>
            {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}{m.faculty ? ` (${m.faculty.code})` : ""}</option>)}
          </Select>
        </div>
      ))}
    </div>
  );
}

export function UsersAdmin() {
  return (
    <Tabs defaultValue="users">
      <TabsList><TabsTrigger value="users">Pengguna</TabsTrigger><TabsTrigger value="import">Import & pembagian</TabsTrigger><TabsTrigger value="groups">Gugus & mentor</TabsTrigger></TabsList>
      <TabsContent value="users" className="mt-6"><UsersTable /></TabsContent>
      <TabsContent value="import" className="mt-6"><ImportPanel /></TabsContent>
      <TabsContent value="groups" className="mt-6"><GroupsPanel /></TabsContent>
    </Tabs>
  );
}
