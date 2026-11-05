import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo resmi Tel-U dari /public/brand. Proporsi dikunci (width/height asli),
 * clear space via padding, tanpa rotasi/efek sesuai brand guideline.
 */
export function Logo({ variant = "horizontal", tone = "color", className, href = "/" }: { variant?: "horizontal" | "vertical"; tone?: "color" | "white"; className?: string; href?: string | null }) {
  const src = variant === "vertical" ? "/brand/logo-telu-vertical.svg" : tone === "white" ? "/brand/logo-telu-horizontal-white.svg" : "/brand/logo-telu-horizontal.svg";
  const img = (
    <Image
      src={src}
      alt="Telkom University"
      width={variant === "vertical" ? 120 : 220}
      height={variant === "vertical" ? 120 : 48}
      priority
      className={cn(variant === "vertical" ? "h-24 w-24" : "h-9 w-auto", "select-none")}
    />
  );
  const wrap = cn("inline-flex shrink-0 p-1", className);
  return href ? <Link href={href} className={wrap} aria-label="Beranda PKKMB Telkom University">{img}</Link> : <span className={wrap}>{img}</span>;
}
