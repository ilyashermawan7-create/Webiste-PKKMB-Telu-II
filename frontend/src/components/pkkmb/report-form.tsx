"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";

const schema = z.object({
  category: z.enum(["KEKERASAN", "PENGADUAN"]),
  subject: z.string().trim().min(5, "Judul minimal 5 karakter").max(150),
  body: z.string().trim().min(20, "Ceritakan minimal 20 karakter agar kami bisa menindaklanjuti").max(5000),
  contact: z.string().trim().max(120).optional(),
  website: z.string().max(0).optional(), // honeypot
});
type Values = z.infer<typeof schema>;

/** Formulir pengaduan anonim: tidak butuh login, tidak menyimpan IP, pelapor mendapat kode + token. */
export function ReportForm() {
  const [result, setResult] = useState<{ code: string; token: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { category: "KEKERASAN" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await api<{ data: { code: string; token: string } }>("/public/reports", { method: "POST", json: values });
      setResult(res.data);
      reset();
    } catch (e) {
      toast.error(e instanceof ClientApiError ? e.message : "Gagal mengirim laporan.");
    }
  });

  if (result) {
    const text = `Kode: ${result.code}\nToken: ${result.token}`;
    return (
      <div className="rounded-2xl border-2 border-success/40 bg-success/5 p-6" role="status">
        <ShieldCheck className="size-8 text-success" aria-hidden />
        <h3 className="mt-3 text-xl font-bold">Laporan diterima. Terima kasih atas keberanianmu.</h3>
        <p className="mt-1 text-sm text-muted-foreground">Simpan kode & token di bawah untuk memantau tindak lanjut. Token hanya ditampilkan sekali.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-background p-4 font-mono text-sm">{text}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Disalin"))}><Copy />Salin</Button>
          <Button asChild><Link href={`/lapor/status?code=${result.code}`}>Cek status</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="flex gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />Anonim: tidak perlu login, nama & alamat IP tidak disimpan. Laporan kekerasan langsung diteruskan ke Satgas PPKS.</p>
      <div>
        <Label htmlFor="category">Jenis laporan</Label>
        <Select id="category" {...register("category")}>
          <option value="KEKERASAN">Kekerasan / perpeloncoan / pelecehan</option>
          <option value="PENGADUAN">Pengaduan lain terkait PKKMB</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="subject">Judul singkat</Label>
        <Input id="subject" aria-invalid={!!errors.subject} aria-describedby="subject-err" {...register("subject")} placeholder="mis. Bentakan saat sesi gugus" />
        <FieldError id="subject-err" message={errors.subject?.message} />
      </div>
      <div>
        <Label htmlFor="body">Kronologi</Label>
        <Textarea id="body" rows={6} aria-invalid={!!errors.body} aria-describedby="body-err" {...register("body")} placeholder="Apa yang terjadi, kapan, di mana. Tidak perlu menyebut identitasmu." />
        <FieldError id="body-err" message={errors.body?.message} />
      </div>
      <div>
        <Label htmlFor="contact">Kontak (opsional)</Label>
        <Input id="contact" {...register("contact")} placeholder="Isi jika bersedia dihubungi (email/WA)" />
      </div>
      <div className="hidden" aria-hidden><label>Website<input tabIndex={-1} autoComplete="off" {...register("website")} /></label></div>
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">Kirim laporan anonim</Button>
    </form>
  );
}
