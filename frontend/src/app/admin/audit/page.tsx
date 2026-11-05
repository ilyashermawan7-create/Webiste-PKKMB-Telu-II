import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";

export const metadata = { title: "Audit Log" };

type Log = { id: number; action: string; subject_type: string | null; subject_id: string | null; changes: Record<string, unknown> | null; ip: string | null; created_at: string; user: { name: string; role: string } | null };

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  const res = await serverApi<{ data: Log[]; current_page: number; last_page: number; total: number }>(`/admin/audit-logs?page=${Number(page) || 1}`);
  return (
    <>
      <PageTitle title="Audit log" description={`${res.total} aksi tercatat. Field sensitif (password, file) tidak disimpan.`} />
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Waktu</th><th className="p-3">Pengguna</th><th className="p-3">Aksi</th><th className="p-3">Objek</th><th className="p-3">Perubahan</th><th className="p-3">IP</th></tr></thead>
          <tbody>{res.data.map((l) => (
            <tr key={l.id} className="border-t border-border align-top">
              <td className="whitespace-nowrap p-3 text-xs">{new Date(l.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
              <td className="p-3"><span className="font-semibold">{l.user?.name ?? "-"}</span><span className="block text-xs text-muted-foreground">{l.user?.role}</span></td>
              <td className="p-3 font-mono text-xs">{l.action}</td>
              <td className="p-3 text-xs">{l.subject_type ? `${l.subject_type} #${l.subject_id}` : "–"}</td>
              <td className="max-w-xs p-3"><code className="line-clamp-3 break-all text-xs text-muted-foreground">{l.changes ? JSON.stringify(l.changes) : "–"}</code></td>
              <td className="p-3 font-mono text-xs">{l.ip}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <nav className="mt-4 flex justify-end gap-2 text-sm" aria-label="Halaman">
        {res.current_page > 1 && <a className="rounded-lg border border-border px-3 py-1.5" href={`?page=${res.current_page - 1}`}>Sebelumnya</a>}
        <span className="px-2 py-1.5 text-muted-foreground">{res.current_page}/{res.last_page}</span>
        {res.current_page < res.last_page && <a className="rounded-lg border border-border px-3 py-1.5" href={`?page=${res.current_page + 1}`}>Berikutnya</a>}
      </nav>
    </>
  );
}
