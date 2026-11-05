import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo resmi PKKMB 2026 Telkom University (file di /public/brand).
 * - Proporsi dikunci (width/height asli), tanpa rotasi/efek/ubah warna.
 * - Di atas latar merah/gelap, emblem selalu diletakkan di badge putih (clear space)
 *   karena unsur abu-abu logo tidak kontras di latar gelap.
 *
 * variant:
 *  - "horizontal": emblem + teks nama (navbar, sidebar, footer)
 *  - "full": logo potret lengkap (hero, login, sertifikat)
 *  - "mark": emblem saja
 */
type Props = {
  variant?: "horizontal" | "full" | "mark";
  /** true bila logo berada di atas latar merah/gelap */
  onColor?: boolean;
  className?: string;
  href?: string | null;
  priority?: boolean;
};

export function Logo({ variant = "horizontal", onColor = false, className, href = "/", priority = true }: Props) {
  let content: React.ReactNode;

  if (variant === "full") {
    content = (
      <span className={cn("inline-flex rounded-3xl bg-white p-4 shadow-sm", !onColor && "bg-transparent p-0 shadow-none")}>
        <Image src="/brand/logo-pkkmb.png" alt="Logo PKKMB 2026 Telkom University" width={618} height={900} priority={priority} className="h-auto w-full" sizes="(max-width: 768px) 50vw, 240px" />
      </span>
    );
  } else {
    const mark = (
      <span className={cn("inline-grid shrink-0 place-items-center rounded-xl bg-white p-1", onColor ? "shadow-sm" : "border border-border dark:border-transparent")}>
        <Image src="/brand/logo-pkkmb-mark.png" alt={variant === "mark" ? "Logo PKKMB 2026 Telkom University" : ""} width={194} height={256} priority={priority} className="h-8 w-auto" />
      </span>
    );
    content = variant === "mark" ? mark : (
      <span className="inline-flex items-center gap-2.5">
        {mark}
        <span className="leading-none">
          <span className={cn("block font-heading text-[15px] font-extrabold tracking-tight", onColor ? "text-white" : "text-telu-maroon dark:text-primary")}>PKKMB 2026</span>
          <span className={cn("mt-0.5 block text-[11px] font-semibold uppercase tracking-wider", onColor ? "text-white/85" : "text-telu-gray dark:text-muted-foreground")}>Telkom University</span>
        </span>
      </span>
    );
  }

  const wrap = cn("inline-flex shrink-0", className);
  return href ? (
    <Link href={href} className={wrap} aria-label="PKKMB 2026 Telkom University — beranda">{content}</Link>
  ) : (
    <span className={wrap}>{content}</span>
  );
}
