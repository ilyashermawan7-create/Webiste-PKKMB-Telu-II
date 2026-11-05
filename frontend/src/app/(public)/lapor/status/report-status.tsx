"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

type Status = { code: string; status: string; created_at: string; replies: { body: string; created_at: string }[] };
const LABEL: Record<string, string> = { OPEN: "Diterima", IN_PROGRESS: "Sedang ditangani", RESOLVED: "Selesai ditangani", CLOSED: "Ditutup" };

export function ReportStatus({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [token, setToken] = useState("");
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api<{ data: Status }>(`/public/reports/${encodeURIComponent(code.trim())}?token=${encodeURIComponent(token.trim())}`);
      setData(res.data);
    } catch (err) {
      setData(null);
      setError(err instanceof ClientApiError ? err.message : "Gagal memeriksa status.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={check} className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <div><Label htmlFor="code">Kode laporan</Label><Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="LPR-XXXXXXXX" required /></div>
        <div><Label htmlFor="token">Token</Label><Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required minLength={32} maxLength={32} autoComplete="off" /></div>
        <FieldError message={error} />
        <Button type="submit" loading={loading}>Cek status</Button>
      </form>
      {data && (
        <div className="rounded-3xl border border-border bg-card p-6" role="status">
          <div className="flex items-center justify-between"><p className="font-mono font-bold">{data.code}</p><Badge variant={data.status === "RESOLVED" ? "success" : "default"}>{LABEL[data.status] ?? data.status}</Badge></div>
          <p className="mt-1 text-sm text-muted-foreground">Dikirim {formatDate(data.created_at)}</p>
          <h3 className="mt-5 font-bold">Tanggapan Satgas</h3>
          {data.replies.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Belum ada tanggapan. Laporanmu sedang ditinjau.</p> : (
            <ul className="mt-2 space-y-2">{data.replies.map((r, i) => <li key={i} className="rounded-xl bg-muted p-3 text-sm">{r.body}<span className="mt-1 block text-xs text-muted-foreground">{formatDate(r.created_at)}</span></li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
}
