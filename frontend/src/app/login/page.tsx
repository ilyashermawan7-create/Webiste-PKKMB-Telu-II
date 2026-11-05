import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { CircuitBg } from "@/components/pkkmb/circuit-bg";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Hanya izinkan redirect internal (cegah open redirect)
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-telu-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-tech-grid absolute inset-0 opacity-30 [--foreground:#fff]" aria-hidden />
        <CircuitBg className="text-white/15" />
        <Logo tone="white" className="relative" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">PKKMB Telkom University</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-tight">Halo, Young TeluTizen!</h1>
          <p className="mt-4 max-w-md text-lg text-white/85">Masuk untuk melihat jadwal, presensi, tugas, materi, dan sertifikat PKKMB-mu.</p>
        </div>
        <p className="relative text-sm text-white/70">Creating the Future</p>
      </section>
      <section className="flex flex-col justify-center px-4 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-extrabold">Masuk</h2>
          <p className="mt-1 text-sm text-muted-foreground">Maba memakai NIM; mentor, panitia & admin memakai email.</p>
          <LoginForm next={safeNext} />
          <p className="mt-8 text-center text-sm text-muted-foreground"><Link href="/" className="font-semibold text-primary hover:underline">← Kembali ke beranda</Link></p>
        </div>
      </section>
    </main>
  );
}
