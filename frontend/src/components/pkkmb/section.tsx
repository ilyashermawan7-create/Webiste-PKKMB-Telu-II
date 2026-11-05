import { cn } from "@/lib/utils";
import { CircuitBg } from "./circuit-bg";

export function SectionHeading({ eyebrow, title, description, align = "left", className }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-pretty text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}

/** Header halaman dalam: gradien merah→maroon + grid & sirkuit halus. */
export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="relative -mt-16 overflow-hidden bg-telu-gradient pb-14 pt-32 text-white">
      <div className="bg-tech-grid absolute inset-0 opacity-30 [--foreground:#fff]" aria-hidden />
      <CircuitBg className="text-white/15" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/80">{eyebrow}</p>}
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-pretty text-lg text-white/85">{description}</p>}
        {children}
      </div>
    </section>
  );
}

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6", className)} {...props} />;
}
