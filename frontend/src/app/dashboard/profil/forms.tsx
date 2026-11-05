"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { api, ClientApiError } from "@/lib/api-client";

export function ProfileForms({ phone, accessibility }: { phone: string; accessibility: string }) {
  const [p, setP] = useState({ phone, accessibility_needs: accessibility });
  const [pw, setPw] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<"" | "profile" | "pw">("");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy("profile");
    try { await api("/auth/profile", { method: "PATCH", json: p }); toast.success("Profil disimpan"); }
    catch (er) { toast.error(er instanceof ClientApiError ? er.message : "Gagal menyimpan"); } finally { setBusy(""); }
  };
  const savePw = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (pw.password !== pw.password_confirmation) return setErr("Konfirmasi kata sandi tidak cocok.");
    setBusy("pw");
    try { await api("/auth/password", { method: "POST", json: pw }); toast.success("Kata sandi diperbarui"); setPw({ current_password: "", password: "", password_confirmation: "" }); }
    catch (er) { setErr(er instanceof ClientApiError ? (er.errors ? Object.values(er.errors)[0]?.[0] ?? er.message : er.message) : "Gagal"); } finally { setBusy(""); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Kontak & aksesibilitas</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div><Label htmlFor="phone">No. WhatsApp</Label><Input id="phone" inputMode="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="628…" /></div>
            <div><Label htmlFor="acc">Kebutuhan aksesibilitas (opsional)</Label><Textarea id="acc" rows={3} value={p.accessibility_needs} onChange={(e) => setP({ ...p, accessibility_needs: e.target.value })} placeholder="mis. kursi roda, juru bahasa isyarat, materi huruf besar" /><p className="mt-1 text-xs text-muted-foreground">Hanya terlihat oleh mentor & panitia untuk menyiapkan akomodasi.</p></div>
            <Button type="submit" loading={busy === "profile"}>Simpan</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Ganti kata sandi</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={savePw} className="space-y-4">
            <div><Label htmlFor="cur">Kata sandi saat ini</Label><Input id="cur" type="password" autoComplete="current-password" required value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} /></div>
            <div><Label htmlFor="new">Kata sandi baru (min. 8)</Label><Input id="new" type="password" autoComplete="new-password" minLength={8} required value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} /></div>
            <div><Label htmlFor="conf">Ulangi kata sandi baru</Label><Input id="conf" type="password" autoComplete="new-password" required value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} /></div>
            <FieldError message={err} />
            <Button type="submit" loading={busy === "pw"}>Perbarui</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
