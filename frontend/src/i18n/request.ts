import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

/** Bahasa dipilih via cookie NEXT_LOCALE (tanpa prefix URL agar link tetap sederhana). */
export default getRequestConfig(async () => {
  const value = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale: Locale = value === "en" ? "en" : "id";
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
