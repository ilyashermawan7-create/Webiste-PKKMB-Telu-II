/** Konfigurasi lingkungan frontend. */
export const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3000";
export const TOKEN_COOKIE = "pkkmb_token";
export const ROLE_COOKIE = "pkkmb_role";
export const HOME_COOKIE = "pkkmb_home";

/** Halaman awal per role setelah login. */
export const HOME_BY_ROLE = {
  MABA: "/dashboard",
  MENTOR: "/mentor",
  PANITIA: "/admin",
  ADMIN: "/admin",
} as const;
