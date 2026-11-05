import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan className Tailwind tanpa konflik. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tz = "Asia/Jakarta";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: tz, day: "numeric", month: "long", year: "numeric", ...opts }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");
}
