import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { API_URL, TOKEN_COOKIE } from "./config";
import type { User } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

/** Fetch ke Laravel dari server component, otomatis menyertakan token user (bila ada). */
export async function serverApi<T>(path: string, init: RequestInit & { revalidate?: number | false } = {}): Promise<T> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const { revalidate, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
    ...(token ? { cache: "no-store" as const } : { next: { revalidate: revalidate ?? 60 } }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText, body.errors);
  }
  return res.json() as Promise<T>;
}

/**
 * Data publik dengan ISR + fallback: halaman tetap tampil walau API sedang tidak terjangkau.
 * Response Laravel berbentuk `{ data: T }`.
 */
export async function publicApi<T>(path: string, fallback: T, revalidate = 300): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/public${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    return (json.data ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** User yang sedang login (di-cache per request). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { data } = await serverApi<{ data: User }>("/auth/me");
    return data;
  } catch {
    return null;
  }
});
