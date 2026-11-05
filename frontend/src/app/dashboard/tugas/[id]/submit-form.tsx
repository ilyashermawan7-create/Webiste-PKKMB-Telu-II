"use client";

import { FileUp, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";
import type { Assignment } from "@/lib/types";

const MAX = 10 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function SubmitForm({ assignment }: { assignment: Assignment }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState(assignment.submission?.url ?? "");
  const [text, setText] = useState(assignment.submission?.text ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Validasi klien (server tetap memvalidasi ulang tipe MIME & ukuran)
    if (assignment.type === "FILE") {
      if (!file) return setError("Pilih file terlebih dahulu.");
      if (!TYPES.includes(file.type)) return setError("Format harus PDF, JPG, PNG, atau WEBP.");
      if (file.size > MAX) return setError("Ukuran file maksimal 10 MB.");
    }
    if (assignment.type === "LINK" && !/^https:\/\//.test(url)) return setError("Tautan harus diawali https://");
    if (assignment.type === "TEXT" && text.trim().length < 20) return setError("Minimal 20 karakter.");

    setBusy(true);
    try {
      if (assignment.type === "FILE") {
        const fd = new FormData();
        fd.append("file", file!);
        await api(`/assignments/${assignment.id}/submit`, { method: "POST", body: fd });
      } else {
        await api(`/assignments/${assignment.id}/submit`, { method: "POST", json: assignment.type === "LINK" ? { url } : { text } });
      }
      toast.success("Tugas terkirim!");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ClientApiError ? (err.errors ? Object.values(err.errors)[0]?.[0] ?? err.message : err.message) : "Gagal mengirim.");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {assignment.type === "FILE" && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center transition hover:border-telu-red/50 focus-within:ring-2 focus-within:ring-ring">
          <FileUp className="size-8 text-primary" aria-hidden />
          <span className="text-sm font-semibold">{file ? file.name : "Pilih file (PDF/JPG/PNG/WEBP, maks 10 MB)"}</span>
          {file && <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
          <input type="file" className="sr-only" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      )}
      {assignment.type === "LINK" && <div><Label htmlFor="url">Tautan (mis. YouTube unlisted)</Label><Input id="url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" /></div>}
      {assignment.type === "TEXT" && <div><Label htmlFor="text">Jawaban</Label><Textarea id="text" rows={8} value={text} onChange={(e) => setText(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">{text.trim().split(/\s+/).filter(Boolean).length} kata</p></div>}
      <FieldError message={error} />
      <Button type="submit" loading={busy} className="w-full"><Send />{assignment.submission ? "Kirim ulang" : "Kumpulkan"}</Button>
    </form>
  );
}
