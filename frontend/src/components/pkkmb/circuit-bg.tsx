import { cn } from "@/lib/utils";

/** Ornamen garis sirkuit tipis bernuansa teknologi (dekoratif, disembunyikan dari pembaca layar). */
export function CircuitBg({ className }: { className?: string }) {
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" fill="none">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 120h220l40 40h180l30-30h160" />
        <path d="M1200 90H960l-40 40H760" />
        <path d="M0 460h140l50-50h240l40 40h120" />
        <path d="M1200 500h-180l-60-60H800l-30 30H640" />
        <path d="M980 0v80l40 40v120" />
        <path d="M300 600v-90l-40-40v-80" />
      </g>
      <g fill="currentColor">
        <circle cx="630" cy="130" r="4" /><circle cx="760" cy="130" r="4" /><circle cx="610" cy="450" r="4" />
        <circle cx="640" cy="470" r="4" /><circle cx="1020" cy="240" r="4" /><circle cx="260" cy="390" r="4" />
      </g>
    </svg>
  );
}
