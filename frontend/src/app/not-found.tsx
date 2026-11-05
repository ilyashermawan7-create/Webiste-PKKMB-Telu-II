import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-heading text-8xl font-extrabold text-telu-gradient">404</p>
        <h1 className="mt-2 text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-muted-foreground">Mungkin tautannya sudah berubah.</p>
        <Button asChild className="mt-6"><Link href="/">Kembali ke beranda</Link></Button>
      </div>
    </main>
  );
}
