"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { HOME_BY_ROLE } from "@/lib/config";
import type { Role, User } from "@/lib/types";

const schema = z.object({
  nim: z.string().trim().min(3, "Isi NIM atau email"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  remember: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

const DEMO = [
  ["Maba", "1301260001"], ["Mentor", "mentor@pkkmb.telkomuniversity.ac.id"],
  ["Panitia", "panitia@pkkmb.telkomuniversity.ac.id"], ["Admin", "admin@pkkmb.telkomuniversity.ac.id"],
] as const;

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(res.status === 429 ? "Terlalu banyak percobaan. Coba lagi dalam 1 menit." : body.message ?? "Login gagal.");
      return;
    }
    const role = (body.user as User).role as Role;
    router.replace(next ?? HOME_BY_ROLE[role]);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
      <div>
        <Label htmlFor="nim">NIM / Email</Label>
        <Input id="nim" autoComplete="username" inputMode="text" aria-invalid={!!errors.nim} aria-describedby="nim-err" {...register("nim")} />
        <FieldError id="nim-err" message={errors.nim?.message} />
      </div>
      <div>
        <Label htmlFor="password">Kata sandi</Label>
        <div className="relative">
          <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" aria-invalid={!!errors.password} aria-describedby="pw-err" className="pr-11" {...register("password")} />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <FieldError id="pw-err" message={errors.password?.message} />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[#B6252A]" {...register("remember")} />Ingat saya di perangkat ini</label>
      {serverError && <p role="alert" className="rounded-xl bg-telu-red-50 p-3 text-sm font-medium text-telu-maroon dark:bg-telu-red/15 dark:text-primary">{serverError}</p>}
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}><KeyRound />Masuk</Button>
      <Button type="button" variant="outline" size="lg" className="w-full" disabled title="Adapter SSO kampus disiapkan di backend (SSO_DRIVER)">Masuk dengan SSO Tel-U</Button>

      {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
        <div className="rounded-2xl border border-dashed border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Akun demo (sandi: password)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO.map(([label, id]) => (
              <button key={label} type="button" className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold hover:bg-telu-red-50 hover:text-telu-maroon" onClick={() => { setValue("nim", id); setValue("password", "password"); }}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
